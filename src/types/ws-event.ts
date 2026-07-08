export type WsEvent = {
    type: "snapshot_required" | "login_ok" | "reconnect";
    payload?: any;
};
