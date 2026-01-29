import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime
import pywifi
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from zones import ZONE_MAP

# -------------------------
# FIREBASE ADMIN INIT
# -------------------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://demoproject-98876-default-rtdb.firebaseio.com"
})

# -------------------------
# FLASK APP
# -------------------------
app = Flask(__name__)
CORS(app)

# -------------------------
# SINGLE SOURCE OF VISITORS
# -------------------------
VISITORS = {}

# -------------------------
# WIFI SETUP (ONCE)
# -------------------------
wifi = pywifi.PyWiFi()
iface = wifi.interfaces()[0]

# -------------------------
# REHYDRATE VISITORS ON START
# -------------------------
def load_active_visitors_from_firebase():
    """
    Rebuild in-memory VISITORS dict from Firebase
    Handles both dict-style and list-style data
    """
    VISITORS.clear()

    ref = db.reference("visitorRequests")
    data = ref.get()

    if not data:
        print("No visitors found in Firebase")
        return

    # CASE 1: Firebase returned a LIST
    if isinstance(data, list):
        visitors_iterable = data
    else:
        # CASE 2: Firebase returned a DICT
        visitors_iterable = data.values()

    for visitor in visitors_iterable:
        if not visitor:
            continue

        if visitor.get("status") == "INSIDE":
            name = visitor.get("name")
            if not name:
                continue

            now_time = datetime.now().strftime("%H:%M:%S")

            VISITORS[name] = {
                "name": name,
                "current": "Gate",
                "history": [
                    {"time": now_time, "zone": "Gate"}
                ],
                "in": visitor.get("gateInTime", now_time),
                "out": None,
                "last_seen": time.time()
            }

    print("Rehydrated visitors after restart:")
    for v in VISITORS:
        print(" -", v)


# -------------------------
# TRIANGULATION FUNCTION
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

# -------------------------
# LOCATION UPDATE LOGIC
# -------------------------
def update_locations():
    now = time.time()

    for v in VISITORS.values():

        # skip exited visitors
        if v["out"] is not None:
            continue

        new_zone = get_zone_from_wifi()

        # if signal detected
        if new_zone != "Unknown Zone":
            v["last_seen"] = now

            if v["current"] != new_zone:
                v["current"] = new_zone
                v["history"].append({
                    "time": datetime.now().strftime("%H:%M:%S"),
                    "zone": new_zone
                })

        # EXIT LOGIC (25 seconds timeout)
        elif now - v["last_seen"] > 2500000:
            v["out"] = datetime.now().strftime("%H:%M:%S")
            print(f"{v['name']} exited at {v['out']}")

# -------------------------
# GET VISITORS (FRONTEND)
# -------------------------
@app.route("/visitors")
def get_visitors():
    update_locations()
    return jsonify(list(VISITORS.values()))

# -------------------------
# CHECK-IN
# -------------------------
@app.route("/checkin", methods=["POST"])
def checkin():
    data = request.json
    name = data.get("name")

    if not name:
        return {"error": "name required"}, 400

    now_time = datetime.now().strftime("%H:%M:%S")

    VISITORS[name] = {
        "name": name,
        "in": now_time,
        "out": None,
        "current": "Gate",
        "history": [
            {"time": now_time, "zone": "Gate"}
        ],
        "last_seen": time.time()
    }

    print(f"{name} checked in")
    return {"message": "checked in"}, 200

# -------------------------
# CHECK-OUT
# -------------------------
@app.route("/checkout", methods=["POST"])
def checkout():
    data = request.json
    name = data.get("name")

    if name in VISITORS:
        VISITORS[name]["out"] = datetime.now().strftime("%H:%M:%S")
        print(f"{name} checked out")

    return {"message": "checked out"}, 200

# -------------------------
# RUN SERVER
# -------------------------
if __name__ == "__main__":
    load_active_visitors_from_firebase()
    app.run(host="0.0.0.0", port=5000, debug=True)
