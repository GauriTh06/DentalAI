import asyncio
import json
from backend.app.database import db_instance, connect_to_mongo, close_mongo_connection

async def main():
    await connect_to_mongo()
    scans = await db_instance.scans.find({}).to_list(100)
    print('Recent Scans:')
    for s in scans:
        print(f"User: {s.get('patient_id')} | Type: {s.get('scan_type')} | Label: {s.get('prediction_result', {}).get('label')}")
    await close_mongo_connection()

if __name__ == '__main__':
    asyncio.run(main())
