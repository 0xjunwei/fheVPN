chrome.runtime.onInstalled.addListener(() => {
    console.log('VPN Extension installed');
  });
  
  // Function to set VPN proxy
  export function setVpnProxy(host: string, port: number): void {
    chrome.proxy.settings.set(
      {
        value: {
          mode: "fixed_servers",
          rules: {
            singleProxy: {
              scheme: "http",
              host,
              port
            }
          }
        },
        scope: "regular"
      },
      () => {
        console.log('VPN proxy set');
      }
    );
  }
  
  // Function to remove the VPN proxy
  export function removeVpnProxy(): void {
    chrome.proxy.settings.clear({}, () => {
      console.log('VPN proxy removed');
    });
  }
  