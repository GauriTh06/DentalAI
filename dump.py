import asyncio
import json
from backend.app.database import db_instance, MongoJSONEncoder, connect_to_mongo, close_mongo_connection

async def main():
    await connect_to_mongo()
    scores = await db_instance.health_scores.find({}).to_list(10)
    print("Health Scores:")
    print(json.dumps(scores, cls=MongoJSONEncoder, indent=2))
    
    scans = await db_instance.scans.find({}).to_list(10)
    print("\nScans:")
    print(json.dumps(scans, cls=MongoJSONEncoder, indent=2))
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())

