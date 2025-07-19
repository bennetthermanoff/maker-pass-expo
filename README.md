![image](https://github.com/bennetthermanoff/maker-pass-server/assets/19416922/e7d9f9e2-a849-4a98-a71b-748616ca6def)

### MakerPass is an upcoming iOS/Android app for managing access to machines in makerspaces. It is a successor of the Tulane Makerspace Card Reader System built for _any_ makerspace.

## [Now available on the Apple App Store!](https://apps.apple.com/eg/app/makerpass/id6480350973) Android coming soon!

This repository contains the app-side code for the MakerPass system. MakerPass is built to be self-hosted, with the app connecting to makerspace servers directly.


<img width="200" alt="Home Screen" src="https://github.com/user-attachments/assets/60d9229a-6954-4805-b615-f3d7f50319dd" />
<img width="200" alt="Machine Catalog" src="https://github.com/user-attachments/assets/4afe785a-8cb0-435e-9e50-0cb32d34920b" />
<img width="200" alt="Train User Screen" src="https://github.com/user-attachments/assets/dbde80e7-22b4-48f5-aadd-8b1f12a0e26e" />
<img width="200" alt="Location Selection" src="https://github.com/user-attachments/assets/3bb6d481-77da-4d3e-9dd7-73cbfa30f415" />

MakerPass additionally hosts a MQTT server for communication with wifi relays. **The primary purpose of MakerPass is to only allow certain user's access to certain tools.** At the Tulane Makerspace, users must be trained on each tool, and with MakerPass, they are able to turn on the power to their authorized machines.

MakerPass also allows for keeping track of maintenance through TagOuts.

### License

Copyright (C) 2024 Bennett Hermanoff

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
