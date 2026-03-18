import uuid
from typing import Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate


def _validate_service_payload(name: str) -> None:
    if not name or not name.strip():
        raise ValueError("Service name is required")


def _validate_partial_payload(data: dict) -> None:
    if "name" in data:
        name = data["name"]
        if not name or not name.strip():
            raise ValueError("Service name is required")


def create_service(db: Session, service_data: ServiceCreate) -> Service:
    data = service_data.model_dump()
    data["name"] = data["name"].strip()

    _validate_service_payload(name=data["name"])

    existing = db.query(Service).filter(Service.name == data["name"]).first()
    if existing:
        raise ValueError("Service name already exists")

    try:
        db_service = Service(**data)
        db.add(db_service)
        db.commit()
        db.refresh(db_service)
        return db_service
    except IntegrityError:
        db.rollback()
        raise ValueError("Service name already exists")
    except Exception as e:
        db.rollback()
        raise Exception(f"Error creating service: {str(e)}")


def get_service(db: Session, service_id: uuid.UUID) -> Optional[Service]:
    return db.query(Service).filter(Service.id == service_id).first()


def get_services(db: Session, skip: int = 0, limit: int = 100) -> list[Service]:
    return db.query(Service).offset(skip).limit(limit).all()


def update_service(db: Session, service_id: uuid.UUID, service_data: ServiceUpdate) -> Service:
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise ValueError("Service not found")

    data = service_data.model_dump()
    data["name"] = data.get("name", "").strip()

    _validate_partial_payload(data)

    existing = db.query(Service).filter(
        Service.name == data["name"],
        Service.id != service_id,
    ).first()
    if existing:
        raise ValueError("Service name already exists")

    try:
        for field, value in data.items():
            setattr(db_service, field, value)
        db.commit()
        db.refresh(db_service)
        return db_service
    except IntegrityError:
        db.rollback()
        raise ValueError("Service name already exists")
    except Exception as e:
        db.rollback()
        raise Exception(f"Error updating service: {str(e)}")


def delete_service(db: Session, service_id: uuid.UUID) -> bool:
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise ValueError("Service not found")

    try:
        db.delete(db_service)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise Exception(f"Error deleting service: {str(e)}")
