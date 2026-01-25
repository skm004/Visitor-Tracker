from datetime import datetime
import pywifi
import time
from flask import Flask, jsonify
from flask_cors import CORS
from zones import ZONE_MAP


app = Flask(__name__)
CORS(app)


# -------------------------
# WIFI SETUP (only once)
# -------------------------
wifi = pywifi.PyWiFi()
iface = wifi.interfaces()[0]





# -------------------------
# 🔥 TRIANGULATION FUNCTION
# -------------------------
def get_zone_from_wifi():
    iface.scan()
    time.sleep(2)
    results = iface.scan_results()

    strongest_net = None

    for net in results:
        if net.bssid:
            if strongest_net is None or net.signal > strongest_net.signal:
                strongest_net = net

    if strongest_net:
        return ZONE_MAP.get(strongest_net.bssid, "Unknown Zone")

    return "Unknown Zone"

VISITORS = {
    "Rahul": {
        "name": "Rahul",
        "in": datetime.now().strftime("%H:%M:%S"),
        "out": None,
        "current": "Gate",
        "history": [],
        "last_seen": time.time()
    }
}


def update_locations():
    for v in VISITORS.values():

        # already exited
        if v["out"] is not None:
            continue

        new_zone = get_zone_from_wifi()

        now = time.time()

        # if zone detected
        if new_zone != "Unknown Zone":

            v["last_seen"] = now  # ⭐ update last seen

            if v["current"] != new_zone:
                v["current"] = new_zone
                v["history"].append({
                    "time": datetime.now().strftime("%H:%M:%S"),
                    "zone": new_zone
                })

        # 🔥 EXIT LOGIC (no signal for 25 sec)
        elif now - v["last_seen"] > 25:
            v["out"] = datetime.now().strftime("%H:%M:%S")
            print(f"{v['name']} exited at {v['out']}")

    for v in VISITORS.values():

        if v["out"] is not None:
            continue

        new_zone = get_zone_from_wifi()   # 🔥 REAL WIFI HERE

        if v["current"] != new_zone:
            v["current"] = new_zone
            v["history"].append({
                "time": datetime.now().strftime("%H:%M:%S"),
                "zone": new_zone
            })

@app.route("/visitors")
def visitors():
    update_locations()
    return jsonify(list(VISITORS.values()))

if __name__ == "__main__":
    app.run(port=5000, debug=True)
