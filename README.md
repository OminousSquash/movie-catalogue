
Commands: 

    docker compose up --build in root folder to start application
    
    Whenever changes are made to the database or endpoints run these commands
    docker compose down -v
    rm -rf ./mysql
    docker compose up --build


For devs:

Please create your own branch and create a merge PR
Branch naming convention should be devname/purpose-of-branch eg: vsrinivasan/creating-database-schema

Raw data source downloaded from: https://datasets.imdbws.com/ 
Download and store in datasets/IMDb/raw

For testing endpoints using Swagger on localhost:8000

For testing authentication and user lists (see [user_list_crud_controller.py](backend/controllers/user_list_crud_controller.py) and [login_signup_controller.py](/backend/controllers/login_signup_controller.py]) use Postman [Link to download](https://www.postman.com/downloads/]))

How to test authentication:
    1. Send a request to signup endpoint. Reference [login_signup_controller](/backend/controllers/login_signup_controller.py) to see endpoint structure
    2. Send a request to login endpoint using the same credentials
    3. Copy the bearer token sent back from the backend
    4. On the Authorization tab in Postman, select Bearer Token and paste the Bearer token you received from the server
    5. You now have permissions to create, update and delete lists. Reference [user_list_crud_controller.py](/backend/controllers/user_list_crud_controller.py) for endpoint structure


