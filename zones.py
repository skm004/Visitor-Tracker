# ─────────────────────────────────────────────────────────────
# ZONE MAP — BSSID → Zone Name
#
# These MUST match the Android app's ZONE_MAP in WifiScanHelper.kt
# The Android app writes currentZone directly to Firebase,
# but this server-side map is used for the Flask /visitors endpoint.
#
# Current Android ZONE_MAP:
#   "c4:e9:0a:e3:d2:02" → "my room wifi"
#   "be:55:db:b0:28:06" → "my beside house"
#   "ae:ee:21:0a:4b:b7" → "near phone"
# ─────────────────────────────────────────────────────────────
ZONE_MAP = {
    "c4:e9:0a:e3:d2:02": "my room wifi",
    "be:55:db:b0:28:06": "my beside house",
    "ae:ee:21:0a:4b:b7": "near phone"
}