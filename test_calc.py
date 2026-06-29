import asyncio
from backend.app.database import db_instance, connect_to_mongo, close_mongo_connection
from backend.app.routes.predict import calculate_and_save_health_index
from bson import ObjectId

async def main():
    await connect_to_mongo()
    
    # Get any user that has multiple scans
    user_id_str = "6a42aae63695a23e1b2b57e4"
    patient_id = ObjectId(user_id_str)
    
    # Calculate health index directly using the function
    health_score = await calculate_and_save_health_index(patient_id)
    print("Calculated Health Score for 6a42aae63695a23e1b2b57e4:")
    print(health_score)
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
