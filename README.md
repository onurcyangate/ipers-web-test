## 💿 Install

Set up your project using your preferred package manager. Use the corresponding command to install the dependencies:

| Package Manager                                                | Command        |
|---------------------------------------------------------------|----------------|
| [yarn](https://yarnpkg.com/getting-started)                   | `yarn install` |



## 💡 Usage

This section covers how to start the development server and build your project for production.

### Starting the Development Server

To start the development server with hot-reload, run the following command. The server will be accessible at [http://localhost:3000](http://localhost:3000):

```bash
yarn dev
```

(Repeat for npm, pnpm, and bun with respective commands.)

### Building for Production

To build your project for production, use:

```bash
yarn build
```

(Repeat for npm, pnpm, and bun with respective commands.)

Once the build process is completed, your application will be ready for deployment in a production environment.


____

## Deploy to IIS
### Configure IIS
- Open IIS Manager
- Right-click on "Sites"
- Select "Add Website" (or add as an application under an existing site)
- Fill in the following details:
  - Site name: Your application name 
  - Physical path: Path to your application files 
  - Binding information: Port number and hostname

### Configure URL Rewrite Rules
- Copy the web.config file located in this repository's root level and put it under application's root directory():

### Deploy the build
- Copy all contents under the dist folder of this repository to the IIS website/application directory
- Set folder permissions:
  - Right-click on your application folder in IIS 
  - Select "Edit Permissions"
