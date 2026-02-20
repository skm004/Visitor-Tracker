import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime
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
# ACTIVE VISITORS (RAM)
# -------------------------
VISITORS = {}

# -------------------------
# WIFI SETUP
# -------------------------



# -------------------------
# 🔑 FIREBASE HELPERS
# -------------------------
def get_firebase_visitor_ref(name):
    ref = db.reference("visitorRequests")
    data = ref.get()

    if not data:
        return None

    for key, visitor in data.items():
        if visitor and visitor.get("name") == name:
            return ref.child(key)

    return None


def append_history_to_firebase(name, entry):
    ref = get_firebase_visitor_ref(name)
    if not ref:
        return

    history = ref.child("history").get() or []
    history.append(entry)

    ref.update({
        "history": history,
        "currentZone": entry["zone"]
    })


def update_exit_in_firebase(name, out_time):
    ref = get_firebase_visitor_ref(name)
    if not ref:
        return

    ref.update({
        "gateOutTime": out_time,
        "status": "EXITED"
    })

# -------------------------
# REHYDRATE VISITORS
# -------------------------
def load_active_visitors_from_firebase():
    VISITORS.clear()

    ref = db.reference("visitorRequests")
    data = ref.get()

    if not data:
        return

    for visitor in data.values():
        if visitor and visitor.get("status") == "INSIDE":
            name = visitor.get("name")
            if not name:
                continue

            VISITORS[name] = {
                "name": name,
                "current": visitor.get("currentZone", "Gate"),
                "history": visitor.get("history", []),
                "in": visitor.get("gateInTime"),
                "out": None,
                "last_seen": time.time()
            }

    print("Rehydrated visitors:", list(VISITORS.keys()))

# -------------------------
# WIFI TRIANGULATION
# -------------------------
def get_zone_from_wifi():
    iface.scan()
    time.sleep(2)
    results = iface.scan_results()

    strongest = None
    for net in results:
        if net.bssid and (not strongest or net.signal > strongest.signal):
            strongest = net

    return ZONE_MAP.get(strongest.bssid, "Unknown Zone") if strongest else "Unknown Zone"

# -------------------------
# LOCATION UPDATE LOGIC
# -------------------------
def update_locations():
    now = time.time()
    ref = db.reference("visitorRequests")
    data = ref.get()

    if not data:
        return

    for v in VISITORS.values():
        if v["out"] is not None:
            continue

        # Find this visitor's Firebase record
        for key, record in data.items():
            if record and record.get("name") == v["name"]:
                new_zone = record.get("currentZone", "")

                if new_zone and new_zone != "Unknown Zone":
                    v["last_seen"] = now

                    if v["current"] != new_zone:
                        v["current"] = new_zone
                        entry = {
                            "time": datetime.now().strftime("%H:%M:%S"),
                            "zone": new_zone
                        }
                        v["history"].append(entry)
                        # No need to write back, mobile already wrote it

                elif now - v["last_seen"] > 25:
                    out_time = datetime.now().strftime("%H:%M:%S")
                    v["out"] = out_time
                    update_exit_in_firebase(v["name"], out_time)

                break

# -------------------------
# API: GET VISITORS
# -------------------------
@app.route("/visitors")
def get_visitors():
    update_locations()
    return jsonify(list(VISITORS.values()))

# -------------------------
# API: CHECK-IN
# -------------------------
@app.route("/checkin", methods=["POST"])
def checkin():
    name = request.json.get("name")
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

    ref = get_firebase_visitor_ref(name)
    if ref:
        ref.update({
            "gateInTime": now_time,
            "currentZone": "Gate",
            "history": [{"time": now_time, "zone": "Gate"}],
            "status": "INSIDE"
        })

    print(f"{name} checked in")
    return {"message": "checked in"}, 200

# -------------------------
# API: CHECK-OUT
# -------------------------
@app.route("/checkout", methods=["POST"])
def checkout():
    name = request.json.get("name")

    if name in VISITORS:
        out_time = datetime.now().strftime("%H:%M:%S")
        VISITORS[name]["out"] = out_time
        update_exit_in_firebase(name, out_time)
        print(f"{name} checked out")

    return {"message": "checked out"}, 200

# -------------------------
# RUN SERVER
# -------------------------
if __name__ == "__main__":
    load_active_visitors_from_firebase()
    app.run(host="0.0.0.0", port=5000, debug=True)
