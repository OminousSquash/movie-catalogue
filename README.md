
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

For testing endpoints using Swagger on localhost:8000. (Acc use this its v useful and much better alternative to typing out curl requests and shi)
