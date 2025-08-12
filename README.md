# WLED Dashboard

A modern web application to monitor and control your WLED LED controllers across your home network. Built with React, TypeScript, and Tailwind CSS.

## Features

- 🔍 **Network Discovery**: Automatically scan your network for WLED devices
- 📊 **Real-time Status**: Monitor power, brightness, and sync status of all boards
- 🎛️ **Remote Control**: Turn boards on/off and adjust brightness remotely
- 📡 **Sync Monitoring**: Track SYNC emit and SYNC receive status for each board
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🚀 **Fast & Lightweight**: Built with modern web technologies for optimal performance

## Screenshots

The dashboard provides a clean, card-based interface showing:
- Board name and IP address
- Online/offline status with visual indicators
- SYNC emit and SYNC receive status
- Power controls and brightness sliders
- Board information (version, LED count, uptime, memory)
- Network discovery tools

## Prerequisites

- Node.js 18+ 
- Yarn package manager
- WLED devices on your local network

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xenjke/wled-ui.git
   cd wled-ui
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Network Discovery

1. **Automatic Discovery**: The app will automatically scan your network for WLED devices on first load
2. **Custom Network Range**: Modify the network range (e.g., `192.168.1`) to match your network
3. **Manual Addition**: Add boards manually if they're not discovered automatically

### Monitoring

- **Status Cards**: Each WLED board is displayed in a card showing current status
- **Real-time Updates**: Board status automatically refreshes every 30 seconds
- **Sync Status**: Monitor SYNC emit and SYNC receive for each board
- **Performance Metrics**: View uptime, memory usage, and LED count

### Control

- **Power Toggle**: Turn individual boards on/off
- **Brightness Control**: Adjust brightness using intuitive sliders
- **Individual Refresh**: Refresh specific board status on demand

## Configuration

### Network Settings

The app automatically detects your network range and saves it for future use. You can modify this in the Network Discovery section.

### Auto-refresh

Boards are automatically refreshed every 30 seconds. This interval can be adjusted in the `useWLEDBoards` hook.

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── BoardCard.tsx   # Individual board display
│   ├── NetworkDiscovery.tsx # Network scanning interface
│   └── AddBoardModal.tsx    # Manual board addition
├── hooks/              # Custom React hooks
│   └── useWLEDBoards.ts     # WLED board management
├── services/           # API services
│   └── wledApi.ts     # WLED HTTP API client
├── types/              # TypeScript type definitions
│   └── wled.ts        # WLED data structures
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

### Adding New Features

1. **New Components**: Add to `src/components/`
2. **API Endpoints**: Extend `src/services/wledApi.ts`
3. **Types**: Update `src/types/wled.ts`
4. **Hooks**: Create in `src/hooks/`

## WLED API Integration

The dashboard communicates with WLED devices using their HTTP JSON API:

- **Info Endpoint**: `/json/info` - Device information and capabilities
- **State Endpoint**: `/json/state` - Current power, brightness, and sync status
- **Control**: POST to `/json/state` to modify device state

### Supported WLED Features

- Power on/off
- Brightness control (0-255)
- SYNC status monitoring
- Device information display
- Network discovery

## Troubleshooting

### Common Issues

1. **Boards Not Discovered**
   - Check network range matches your network
   - Ensure WLED devices are powered on and connected
   - Verify firewall settings allow HTTP traffic

2. **Connection Errors**
   - Check IP addresses are correct
   - Verify WLED devices are accessible from your computer
   - Check for network restrictions

3. **Performance Issues**
   - Reduce network scan range
   - Increase refresh intervals
   - Check network bandwidth

### Debug Mode

Enable browser developer tools to see detailed API calls and error messages.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [WLED Project](https://github.com/Aircoookie/WLED) - Amazing LED control firmware
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Beautiful icons

## Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing [GitHub issues](https://github.com/xenjke/wled-ui/issues)
3. Create a new issue with detailed information

---

**Happy LED controlling!** 🎨✨
