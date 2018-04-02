# Backend API for CSC 425

### Steps to install and get running
1. Install the dependencies

   ```
   yarn install
   ```
   *You may use npm instead of yarn*

2. Install the cross-env package globally

   *Note that on linux systems this will need to be done as __sudo__*
   ```
   npm install -g cross-env
   npm install -g sequelize-cli
   npm install -g (mysql2 or sqlite3)
   ```

3. Ensure the database is running on your computer whether it is mysql or
another supported dialect
   + Note that you need to make [Database Config](./config/database-config.json)
   reflect your setup after initalizing it bellow
   + Following the global installs in step 2 run the Following
   ```
   sequelize init:config
   sequelize db:create
   sequelize db:migrate
   ```

4. **Optional:** If you wish to set up the envirment for testing and for using
squelize install the following globally

    *Note that on linux systems this will need to be done as __sudo__*

     ```
     npm install -g eslint
     npm install -g eslint-config-google
     ```
