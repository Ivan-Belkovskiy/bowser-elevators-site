export interface EVPMovementSoundEffects {
    start?: string | File,
    move?: string | File,
    end?: string | File,
}

export interface EVPSoundEffects {
    doorOpen?: string | File,
    doorClose?: string | File,
    buttonClick?: string | File,
    movement?: EVPMovementSoundEffects
}