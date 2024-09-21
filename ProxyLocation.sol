// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@fhenixprotocol/contracts/FHE.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";

// Interface for the ERC20 token standard
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract ProxyLocation is Permissioned {
  struct ServerDetails {
    // Original wallet used to add this server
    address walletCreator;
    // max uint8 = 255, each octet in the array represents 255.255.255.255
    uint256 serverID;
    euint8 firstOctet;
    euint8 secondOctet;
    euint8 thirdOctet;
    euint8 fourthOctet;
    uint128 costToLoan;
    eaddress receivingWallet;
    euint128 currentAmountReceived;
  }
  struct ClientDetails {
    address clientAddress;
    // max uint8 = 255, each octet in the array represents 255.255.255.255
    euint8 firstOctet;
    euint8 secondOctet;
    euint8 thirdOctet;
    euint8 fourthOctet;
    uint256 paidForServerID;
    uint8 addedToWhitelist;
  }
  uint256 _currServerCount;
  IERC20 public paymentToken;

  // Server list, shows ServerID to Country
  mapping(uint256 => string) public _serverCountryList;
  // Server list, quick access to server
  mapping(uint256 => ServerDetails[]) public _serverList;
  // Owners server for them to keep track what they own
  mapping(address => uint256[]) public _serverOwnerToServer;
  // Client mapping for when client has paid
  mapping(uint256 => mapping(address => ClientDetails)) public _serverClientList;

  constructor() {}

  // Emit event when client paid so server can track and whitelist
  event ClientPaidForServer(address indexed client, uint256 serverID, uint256 amount);

  // Add server (Thinking of doing proxy as a service, but can allow anyone to spin up their variant)
  function addServer(
    inEuint8 memory _firstOctet,
    inEuint8 memory _secondOctet,
    inEuint8 memory _thirdOctet,
    inEuint8 memory _fourthOctet,
    uint128 _costToLoan,
    inEaddress memory _receivingAddress,
    string memory _countryServerIsIn
  ) public {
    euint8 _eFirstOctet = FHE.asEuint8(_firstOctet);
    euint8 _eSecondOctet = FHE.asEuint8(_secondOctet);
    euint8 _eThirdOctet = FHE.asEuint8(_thirdOctet);
    euint8 _eFourthOctet = FHE.asEuint8(_fourthOctet);
    eaddress _eRecvAddress = FHE.asEaddress(_receivingAddress);
    // Create the new server details
    ServerDetails memory newServer = ServerDetails({
      walletCreator: msg.sender,
      serverID: _currServerCount,
      firstOctet: _eFirstOctet,
      secondOctet: _secondOctet,
      thirdOctet: _eThirdOctet,
      fourthOctet: _eFourthOctet,
      costToLoan: _costToLoan,
      // Privacy probably be broken the moment you send to this address, as users can track state change, even if hash changes you can know
      // One time use Address will allow you to swap out this wallet to a new one after
      receivingWallet: _eRecvAddress
    });
    // Adding serverlist
    _serverList[_currServerCount] = newServer;
    // Add to country list to display what servers are available
    _serverCountryList[_currServerCount] = _countryServerIsIn;
    // Owner list
    _serverOwnerToServer[msg.sender].push(_currServerCount);
    // Increase curr server count
    _currServerCount++;
  }

  // Pay for server by client to gain access
  function payServerForAccess(
    inEuint8 memory _firstOctet,
    inEuint8 memory _secondOctet,
    inEuint8 memory _thirdOctet,
    inEuint8 memory _fourthOctet,
    uint256 _serverRequested
  ) public {
    require(_serverRequested < _currServerCount, "Server not found");
    ServerDetails storage server = _serverList[_serverRequested];
    // The client can pay even if the cost is 0, so no cost check here
    uint128 cost = server.costToLoan;

    // Transfer the required amount of ERC20 tokens from the client to the server's receiving wallet
    if (cost > 0) {
      require(
        paymentToken.transferFrom(msg.sender, address(this), cost),
        "Payment to contract failed"
      );
    }
    // Record the client payment
    ClientDetails memory newClient = ClientDetails({
      clientID: msg.sender,
      firstOctet: server.firstOctet,
      secondOctet: server.secondOctet,
      thirdOctet: server.thirdOctet,
      fourthOctet: server.fourthOctet,
      paidForServerID: _serverRequested
    });

    _serverClientList[_serverRequested][msg.sender] = newClient;
    
    // Update the server's current amount received only if a payment was made
    if (cost > 0) {
      server.currentAmountReceived = FHE.add(server.currentAmountReceived, FHE.asEuint128(cost))
    };
  }

  // Allow server to modify client status as paid
  function approveClientToViewServer(uint256 _serverID, address _clientAddr) public {
    require(_serverRequested < _currServerCount, "Server not found");
    ServerDetails storage server = _serverList[_serverRequested];
    require(server.walletCreator == msg.sender, "Only the server owner can modify data");
    // Fetch the client details
    ClientDetails storage client = _serverClientList[_serverID][_clientAddr];
    // Modify the client's whitelist status to 1 (approved)
    client.addedToWhitelist = 1;
  }

  // Withdraw payment
  function withdrawFunds(uint256 _serverID) public {
    // Ensure the server exists
    require(_serverID < _currServerCount, "Server not found");
    // Fetch the server details
    ServerDetails storage server = _serverList[_serverID];
    // Ensure that the caller is the owner of the server
    require(server.walletCreator == msg.sender, "Only the server owner can withdraw funds");

    // Ensure that there are funds to withdraw
    uint128 amountToWithdraw = FHE.toUint128(server.currentAmountReceived);
    require(amountToWithdraw > 0, "No funds to withdraw");
    // Decrypt the server's receiving wallet address using FHE.decrypt
    address decryptedReceivingWallet = FHE.asAddress(FHE.decrypt(server.receivingWallet));

    // Reset the server's current amount received to 0 before transferring the funds
    server.currentAmountReceived = FHE.asEuint128(0);

    // Transfer the funds from the contract to the decrypted receiving wallet
    require(
        paymentToken.transfer(decryptedReceivingWallet, amountToWithdraw),
        "Transfer failed"
    );
  }


  // Read client info
  function retrieveClientInfoFirstOctet(
      uint256 serverID,
      address _clientAddress,
      Permission memory perm
  ) public view onlySender(perm) returns (bytes memory) {
      // Check if the server exists
      require(serverID < _currServerCount, "Server not found");
      // Fetch the server details
      ServerDetails storage server = _serverList[serverID];
      // Check if the caller is the owner of the server
      require(server.walletCreator == msg.sender, "Only the server owner can view client info");
      // Fetch the client details
      ClientDetails storage client = _serverClientList[serverID][_clientAddress];

      // Check if the client exists and has paid for the server, also prevent unauthorized access to client ip
      require(client.paidForServerID == serverID, "Client has not paid for access");

      return FHE.sealoutput(
        client.firstOctet, 
        perm.publicKey
      );
  }
  function retrieveClientInfoSecondOctet(
      uint256 serverID,
      address _clientAddress,
      Permission memory perm
  ) public view onlySender(perm) returns (bytes memory) {
      // Check if the server exists
      require(serverID < _currServerCount, "Server not found");
      // Fetch the server details
      ServerDetails storage server = _serverList[serverID];
      // Check if the caller is the owner of the server
      require(server.walletCreator == msg.sender, "Only the server owner can view client info");
      // Fetch the client details
      ClientDetails storage client = _serverClientList[serverID][_clientAddress];

      // Check if the client exists and has paid for the server, also prevent unauthorized access to client ip
      require(client.paidForServerID == serverID, "Client has not paid for access");

      return FHE.sealoutput(
        client.secondOctet, 
        perm.publicKey
      );
  }
  function retrieveClientInfoThirdOctet(
      uint256 serverID,
      address _clientAddress,
      Permission memory perm
  ) public view onlySender(perm) returns (bytes memory) {
      // Check if the server exists
      require(serverID < _currServerCount, "Server not found");
      // Fetch the server details
      ServerDetails storage server = _serverList[serverID];
      // Check if the caller is the owner of the server
      require(server.walletCreator == msg.sender, "Only the server owner can view client info");
      // Fetch the client details
      ClientDetails storage client = _serverClientList[serverID][_clientAddress];

      // Check if the client exists and has paid for the server, also prevent unauthorized access to client ip
      require(client.paidForServerID == serverID, "Client has not paid for access");

      return FHE.sealoutput(
        client.thirdOctet, 
        perm.publicKey
      );
  }
  function retrieveClientInfoFourthOctet(
      uint256 serverID,
      address _clientAddress,
      Permission memory perm
  ) public view onlySender(perm) returns (bytes memory) {
      // Check if the server exists
      require(serverID < _currServerCount, "Server not found");
      // Fetch the server details
      ServerDetails storage server = _serverList[serverID];
      // Check if the caller is the owner of the server
      require(server.walletCreator == msg.sender, "Only the server owner can view client info");
      // Fetch the client details
      ClientDetails storage client = _serverClientList[serverID][_clientAddress];

      // Check if the client exists and has paid for the server, also prevent unauthorized access to client ip
      require(client.paidForServerID == serverID, "Client has not paid for access");

      return FHE.sealoutput(
        client.fourthOctet,
        perm.publicKey
      );
  }


  // read server info after server added you
  function retrieveServerInfoFirstOctet(
      uint256 serverID,
      Permission memory perm
  ) public view onlySender(perm) returns (bytes memory) {
      // Check if the server exists
      require(serverID < _currServerCount, "Server not found");
      // Fetch the server details
      ServerDetails storage server = _serverList[serverID];
      
      // Fetch the client details
      ClientDetails storage client = _serverClientList[serverID][_clientAddress];
      // Check if the client exists and has paid for the server
      require(client.clientID == msg.sender, "Your not the client");
      
      return FHE.sealoutput(
        server.firstOctet, 
        perm.publicKey
      );
  }
  function retrieveServerInfoSecondOctet(
      uint256 serverID,
      Permission memory perm
  ) public view onlySender(perm) returns (bytes memory) {
      // Check if the server exists
      require(serverID < _currServerCount, "Server not found");
      // Fetch the server details
      ServerDetails storage server = _serverList[serverID];
      
      // Fetch the client details
      ClientDetails storage client = _serverClientList[serverID][_clientAddress];
      // Check if the client exists and has paid for the server
      require(client.clientID == msg.sender, "Your not the client");
      
      return FHE.sealoutput(
        server.secondOctet, 
        perm.publicKey
      );
  }
  function retrieveServerInfoThirdOctet(
      uint256 serverID,
      Permission memory perm
  ) public view onlySender(perm) returns (bytes memory) {
      // Check if the server exists
      require(serverID < _currServerCount, "Server not found");
      // Fetch the server details
      ServerDetails storage server = _serverList[serverID];
      
      // Fetch the client details
      ClientDetails storage client = _serverClientList[serverID][_clientAddress];
      // Check if the client exists and has paid for the server
      require(client.clientID == msg.sender, "Your not the client");
      
      return FHE.sealoutput(
        server.thirdOctet, 
        perm.publicKey
      );
  }
  function retrieveServerInfoFourthOctet(
      uint256 serverID,
      Permission memory perm
  ) public view onlySender(perm) returns (bytes memory) {
      // Check if the server exists
      require(serverID < _currServerCount, "Server not found");
      // Fetch the server details
      ServerDetails storage server = _serverList[serverID];
      
      // Fetch the client details
      ClientDetails storage client = _serverClientList[serverID][_clientAddress];
      // Check if the client exists and has paid for the server
      require(client.clientID == msg.sender, "Your not the client");
      
      return FHE.sealoutput(
        server.fourthOctet, 
        perm.publicKey
      );
  }

  // Edit server
  function modifyServerDetails(
    uint256 _serverID,
    inEuint8 memory _firstOctet,
    inEuint8 memory _secondOctet,
    inEuint8 memory _thirdOctet,
    inEuint8 memory _fourthOctet,
    uint128 _costToLoan,
    inEaddress memory _receivingAddress
  ) public {
      // Ensure the server exists
      require(_serverID < _currServerCount, "Server not found");

      // Fetch the server details
      ServerDetails storage server = _serverList[_serverID];

      // Ensure that the caller is the owner of the server
      require(server.walletCreator == msg.sender, "Only the server owner can modify details");

      // Update the server's details
      server.firstOctet = FHE.asEuint8(_firstOctet);
      server.secondOctet = FHE.asEuint8(_secondOctet);
      server.thirdOctet = FHE.asEuint8(_thirdOctet);
      server.fourthOctet = FHE.asEuint8(_fourthOctet);
      server.costToLoan = _costToLoan;
      server.receivingWallet = FHE.asEaddress(_receivingAddress);
  }



  // Function to get all servers for the caller
  function getServersForOwner() public view returns (ServerDetails[] memory) {
    return _serverOwnerToServer[msg.sender];
  }
}
