CLOCKWORKRT.collisions.register({
    shape1: "player",
    shape2: "worldObject",
    detector: function (p, b, data) {
        if ((p.x - b.x) * (p.x - b.x) + (p.y - b.y) * (p.y - b.y) < 10000) {
            return true;
        } else {
            return false;
        }
    }
});
