import snap7
import snap7.util
import sys
import json
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)

def write_pid_to_plc(pid_auto: bool, pid_clasico: bool, pid_servosis: bool):
    # Crear el cliente Snap7
    plc = snap7.client.Client()
    try:
        # Conectar al PLC
        plc.connect('192.168.4.10', 0, 1)
        if plc.get_connected():
            logging.info("Conectado al PLC")
            try:
                db_number = 7
                pid_offset = 7  # Byte 7 para los PID
                size = 1  # 1 byte (8 bits)
                # Leer el byte actual
                byte_data = bytearray(plc.db_read(db_number, pid_offset, size))
                # Modificar los bits correspondientes
                if pid_auto:
                    byte_data[0] |= 1 << 0  # DB7.DBX7.0
                else:
                    byte_data[0] &= ~(1 << 0)
                if pid_clasico:
                    byte_data[0] |= 1 << 1  # DB7.DBX7.1
                else:
                    byte_data[0] &= ~(1 << 1)
                if pid_servosis:
                    byte_data[0] |= 1 << 2  # DB7.DBX7.2
                else:
                    byte_data[0] &= ~(1 << 2)
                # Escribir el byte modificado
                plc.db_write(db_number, pid_offset, byte_data)
                # Verificar la escritura
                verification = plc.db_read(db_number, pid_offset, size)
                verif = verification[0]
                ok = (
                    ((verif >> 0) & 1) == pid_auto and
                    ((verif >> 1) & 1) == pid_clasico and
                    ((verif >> 2) & 1) == pid_servosis
                )
                if ok:
                    result = {
                        "success": True,
                        "message": f"PID_auto={pid_auto}, PID_clasico={pid_clasico}, PID_servosis={pid_servosis} escritos correctamente"
                    }
                else:
                    result = {"success": False, "error": "Error de verificación: el valor escrito no coincide"}
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
    if len(sys.argv) != 4:
        print(json.dumps({
            "success": False,
            "error": "Se requieren tres argumentos: <pid_auto> <pid_clasico> <pid_servosis>"
        }))
        sys.exit(1)
    try:
        pid_auto = sys.argv[1].lower() in ['true', '1', 't', 'y', 'yes']
        pid_clasico = sys.argv[2].lower() in ['true', '1', 't', 'y', 'yes']
        pid_servosis = sys.argv[3].lower() in ['true', '1', 't', 'y', 'yes']
        write_pid_to_plc(pid_auto, pid_clasico, pid_servosis)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Error al procesar los argumentos: {str(e)}"
        }))
        sys.exit(1) 