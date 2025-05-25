# read_plc.py
import snap7
import snap7.util
import time
import logging
import json
import sys

# Configurar logging para que vaya a stderr
logging.basicConfig(level=logging.INFO, stream=sys.stderr)

# Crear el cliente Snap7
plc = snap7.client.Client()

try:
    logging.info("Intentando conectar al PLC...")
    plc.connect('192.168.4.10', 0, 1)

    if plc.get_connected():
        logging.info("Conexión exitosa al PLC")
        status = plc.get_cpu_state()
        logging.info(f"Estado del PLC: {status}")

        try:
            logging.info("\nLeyendo DB7...")
            DB = plc.db_read(7, 0, 8)  # Leer suficiente espacio

            # Leer variables según offsets de la imagen
            setpoint = snap7.util.get_uint(DB, 0)  # UInt en 0.0
            temperatura = snap7.util.get_real(DB, 2)  # Real en 2.0
            b_start = bool(snap7.util.get_bool(DB, 6, 0))
            b_stop = bool(snap7.util.get_bool(DB, 6, 1))
            b_paroE = bool(snap7.util.get_bool(DB, 6, 2))
            b_confirma = bool(snap7.util.get_bool(DB, 6, 3))
            alarma_teh = bool(snap7.util.get_bool(DB, 6, 4))
            alarma_tel = bool(snap7.util.get_bool(DB, 6, 5))
            alarma_sensor = bool(snap7.util.get_bool(DB, 6, 6))
            alarma_actuador = bool(snap7.util.get_bool(DB, 6, 7))
            pid_auto = bool(snap7.util.get_bool(DB, 7, 0))
            pid_clasico = bool(snap7.util.get_bool(DB, 7, 1))
            pid_servosis = bool(snap7.util.get_bool(DB, 7, 2))
            estado_servo = bool(snap7.util.get_bool(DB, 7, 3))
            estado_variador = bool(snap7.util.get_bool(DB, 7, 4))
           
            # Crear diccionario con los datos
            data = {
                "setpoint": setpoint,
                "temperatura": temperatura,
                "b_start": b_start,
                "b_stop": b_stop,
                "b_paroE": b_paroE,
                "b_confirma": b_confirma,
                "alarma_teh": alarma_teh,
                "alarma_tel": alarma_tel,
                "alarma_sensor": alarma_sensor,
                "alarma_actuador": alarma_actuador,
                "pid_auto": pid_auto,
                "pid_clasico": pid_clasico,
                "pid_servosis": pid_servosis,
                "estado_servo": estado_servo,
                "estado_variador": estado_variador
            }

            # Imprimir solo el JSON en stdout
            print(json.dumps(data))

        except Exception as e:
            logging.error(f"Error al acceder al DB7: {str(e)}")
            # Enviar un JSON vacío en caso de error
            print(json.dumps({}))
    else:
        logging.error("No se pudo conectar al PLC")
        # Enviar un JSON vacío en caso de error
        print(json.dumps({"error": "No se pudo conectar al PLC"}))

except Exception as e:
    logging.error(f"Error de conexión: {str(e)}")
    # Enviar un JSON vacío en caso de error
    print(json.dumps({"error": str(e)}))

finally:
    if plc.get_connected():
        plc.disconnect()
        logging.info("Desconectado del PLC")
    plc.destroy()