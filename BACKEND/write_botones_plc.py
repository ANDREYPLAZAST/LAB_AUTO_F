import snap7
import snap7.util
import sys
import json
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)

def write_buttons_to_plc(start: bool, stop: bool, paro_emergencia: bool):
    # Crear el cliente Snap7
    plc = snap7.client.Client()
    
    try:
        # Conectar al PLC
        plc.connect('192.168.4.10', 0, 1)
        
        if plc.get_connected():
            logging.info("Conectado al PLC")
            
            try:
                # Offset correcto para los botones según la imagen: byte 6
                db_number = 7
                start_offset = 6  # Byte 6 para los botones
                size = 1  # 1 byte (8 bits)
                
                # Crear byte de datos
                byte_data = 0
                if start:
                    byte_data |= 1 << 0  # DB7.DBX6.0
                if stop:
                    byte_data |= 1 << 1  # DB7.DBX6.1
                if paro_emergencia:
                    byte_data |= 1 << 2  # DB7.DBX6.2
                
                # Convertir el valor a bytes
                button_bytes = bytearray([byte_data])
                
                # Escribir en el PLC
                plc.db_write(db_number, start_offset, button_bytes)
                
                # Verificar que se escribió correctamente
                verification = plc.db_read(db_number, start_offset, size)
                written_value = verification[0]
                
                if written_value == byte_data:
                    result = {
                        "success": True, 
                        "message": f"Botones escritos correctamente: Start={start}, Stop={stop}, Paro={paro_emergencia}"
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
        
    # Imprimir el resultado como JSON
    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(json.dumps({
            "success": False, 
            "error": "Se requieren tres argumentos: <start> <stop> <paro_emergencia>"
        }))
        sys.exit(1)

    try:
        # Convertir argumentos a booleanos
        start = sys.argv[1].lower() in ['true', '1', 't', 'y', 'yes']
        stop = sys.argv[2].lower() in ['true', '1', 't', 'y', 'yes']
        paro_emergencia = sys.argv[3].lower() in ['true', '1', 't', 'y', 'yes']
        
        write_buttons_to_plc(start, stop, paro_emergencia)
    except Exception as e:
        print(json.dumps({
            "success": False, 
            "error": f"Error al procesar los argumentos: {str(e)}"
        }))
        sys.exit(1) 