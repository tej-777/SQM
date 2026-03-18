from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
from datetime import datetime, date
import uuid
import json

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/queue/{hospital_service_id}/{appointment_date}")
async def websocket_queue_updates(
    websocket: WebSocket,
    hospital_service_id: uuid.UUID,
    appointment_date: date
):
    """WebSocket endpoint for real-time queue updates."""
    
    # Create room key
    room_key = f"{hospital_service_id}:{appointment_date}"
    
    try:
        # Connect to room
        await manager.connect(websocket, room_key)
        
        # Send initial welcome message
        welcome_message = {
            "type": "INITIAL_STATUS",
            "hospital_service_id": str(hospital_service_id),
            "appointment_date": appointment_date.isoformat(),
            "queue_status": None,
            "message": "WebSocket connected successfully"
        }
        await websocket.send_text(json.dumps(welcome_message))
        
        # Keep connection alive and listen for messages
        while True:
            try:
                # Wait for client messages (ping/pong, etc.)
                data = await websocket.receive_text()
                
                # Handle client messages if needed
                if data:
                    try:
                        message = json.loads(data)
                        if message.get("type") == "PING":
                            pong_message = {
                                "type": "PONG",
                                "timestamp": datetime.utcnow().isoformat()
                            }
                            await websocket.send_text(json.dumps(pong_message))
                    except json.JSONDecodeError:
                        pass
                        
            except WebSocketDisconnect:
                break
            except Exception as e:
                break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        pass
    finally:
        # Clean up connection
        manager.disconnect(websocket, room_key)
