export function connectToVpnServer(server: string, port: number): void {
    chrome.proxy.settings.set(
      {
        value: {
          mode: 'fixed_servers',
          rules: {
            singleProxy: {
              scheme: 'http',
              host: server,
              port: port
            }
          }
        },
        scope: 'regular'
      },
      () => {
        console.log('VPN connected');
      }
    );
  }
  
  export function disconnectVpnServer(): void {
    chrome.proxy.settings.clear({}, () => {
      console.log('VPN disconnected');
    });
  }
  