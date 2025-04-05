export function isPhysicsArcadeBody(body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | null): body is Phaser.Physics.Arcade.Body {
  if (body === null || body === undefined) {
    return false;
  }
  return body instanceof Phaser.Physics.Arcade.Body;
}
