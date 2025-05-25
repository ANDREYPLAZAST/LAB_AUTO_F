import snap7
import snap7.util
import sys
import struct
import json
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)

def write_setpoint_and_confirm(setpoint: int, confirmar: bool):
    plc = snap7.client.Client()
    try:
        plc.connect('192.168.4.10', 0, 1)
        if plc.get_connected():
            logging.info("Conectado al PLC")
            try:
                db_number = 7
                # --- Escribir SetPoint (UInt en 0.0) ---
                setpoint_bytes = struct.pack('>H', setpoint)  # UInt (2 bytes, big endian)
                plc.db_write(db_number, 0, setpoint_bytes)
                # --- Escribir Confirmar (Bool en 6.3) ---
                # Leer el byte 6 actual
                byte6 = bytearray(plc.db_read(db_number, 6, 1))
                if confirmar:
                    byte6[0] |= (1 << 3)  # Poner a 1 el bit 3 (DB7.DBX6.3)
                else:
                    byte6[0] &= ~(1 << 3)  # Poner a 0 el bit 3
                plc.db_write(db_number, 6, byte6)
                result = {
                    "success": True,
                    "message": f"Setpoint escrito: {setpoint}, Confirmar: {confirmar}"
                }
            except Exception as e:
                result = {"success": False, "error": f"Error al escribir en el DB: {str(e)}"}
        else:
            result = {"success": False, "error": "No se pudo conectar al PLC"}
    except Exception as e:
        result = {"success": False, "error": f"Error de conexión: {str(e)}"}
    finally:
        if plc.get_connected():
            plc.disconnect()
        plc.destroy()
    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Se requieren dos argumentos: <setpoint> <confirmar>"
        }))
        sys.exit(1)
    try:
        setpoint = int(sys.argv[1])
        confirmar = sys.argv[2].lower() in ['true', '1', 't', 'y', 'yes']
        write_setpoint_and_confirm(setpoint, confirmar)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Error al procesar los argumentos: {str(e)}"
        }))
        sys.exit(1) 