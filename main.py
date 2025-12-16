#!/usr/bin/env python3
"""
Bridge script to start the Node.js application.
The .replit file calls this Python script which then starts the Node.js server.
"""
import os
import subprocess
import sys

def main():
    print("Starting WashBizHub Node.js application...")
    
    # Run npm dev which starts the Express + Vite server
    try:
        subprocess.run(
            ["npm", "run", "dev"],
            check=True,
            env=os.environ
        )
    except subprocess.CalledProcessError as e:
        print(f"Failed to start application: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nApplication stopped.")
        sys.exit(0)

if __name__ == "__main__":
    main()
