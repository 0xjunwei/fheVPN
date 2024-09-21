import socket
import threading
import select
import socks

# List of allowed IPs
ALLOWED_IPS = [""]

BUFFER_SIZE = 4096
SOCKS_PORT = 1080


def handle_client(client_socket, client_address):
    client_ip = client_address[0]

    # IP Filtering
    if client_ip not in ALLOWED_IPS:
        print(f"Blocked IP: {client_ip}")
        client_socket.send(b"Access Denied: Your IP is not allowed")
        client_socket.close()
        return

    # Establish SOCKS5 handshake
    try:
        # Read the client's initial connection request
        data = client_socket.recv(BUFFER_SIZE)
        if len(data) == 0:
            client_socket.close()
            return

        # SOCKS5 initial response (no authentication required)
        client_socket.send(b"\x05\x00")

        # Read client connection details (destination IP/Port)
        conn_request = client_socket.recv(BUFFER_SIZE)
        if conn_request[1] != 0x01:  # Only handle CONNECT commands (0x01)
            print("Only CONNECT requests are supported")
            client_socket.close()
            return

        # Parse the target server's address and port
        addr_type = conn_request[3]
        if addr_type == 0x01:  # IPv4
            dest_addr = socket.inet_ntoa(conn_request[4:8])
            dest_port = int.from_bytes(conn_request[8:10], "big")
        elif addr_type == 0x03:  # Domain name
            domain_len = conn_request[4]
            dest_addr = conn_request[5 : 5 + domain_len].decode("utf-8")
            dest_port = int.from_bytes(
                conn_request[5 + domain_len : 7 + domain_len], "big"
            )
        else:
            print("Address type not supported")
            client_socket.close()
            return

        print(f"Connecting to {dest_addr}:{dest_port} from {client_ip}")

        # Connect to the target server
        remote_socket = socks.socksocket()
        remote_socket.connect((dest_addr, dest_port))

        # Send success response to the client
        client_socket.send(
            b"\x05\x00\x00\x01"
            + socket.inet_aton("0.0.0.0")
            + (1080).to_bytes(2, "big")
        )

        # Relay data between client and remote server
        relay_data(client_socket, remote_socket)

    except Exception as e:
        print(f"Error handling client {client_ip}: {e}")
    finally:
        client_socket.close()


def relay_data(client_socket, remote_socket):
    sockets = [client_socket, remote_socket]
    while True:
        ready_sockets, _, _ = select.select(sockets, [], [])
        for sock in ready_sockets:
            other_sock = client_socket if sock is remote_socket else remote_socket
            data = sock.recv(BUFFER_SIZE)
            if data:
                other_sock.send(data)
            else:
                return


def start_socks_proxy():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("0.0.0.0", SOCKS_PORT))
    server.listen(5)
    print(f"SOCKS5 proxy server running on port {SOCKS_PORT}...")

    while True:
        client_socket, client_address = server.accept()
        print(f"Received connection from {client_address}")

        # Start a new thread to handle the client
        threading.Thread(
            target=handle_client, args=(client_socket, client_address)
        ).start()


if __name__ == "__main__":
    start_socks_proxy()
