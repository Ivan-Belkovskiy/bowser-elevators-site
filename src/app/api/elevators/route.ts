import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { LiftJson, ElevatorButton, ButtonBlock, Floor } from "@/types/elevator";

const soundMap: Record<string, (lift: LiftJson, fileName: string) => void> = {
  sound_doorOpen: (lift, name) => lift.elevator.soundEffects.doorOpen = `assets/sounds/${name}`,
  sound_doorClose: (lift, name) => lift.elevator.soundEffects.doorClose = `assets/sounds/${name}`,
  sound_buttonClick: (lift, name) => lift.elevator.soundEffects.buttonClick = `assets/sounds/${name}`,
  sound_moveStart: (lift, name) => lift.elevator.soundEffects.movement.start = `assets/sounds/${name}`,
  sound_moveLoop: (lift, name) => lift.elevator.soundEffects.movement.move = `assets/sounds/${name}`,
  sound_moveEnd: (lift, name) => lift.elevator.soundEffects.movement.end = `assets/sounds/${name}`,
};

const imageMap: Record<string, (lift: LiftJson, fileName: string) => void> = {
  image_elevator_doors_left: (lift, name) => lift.elevator.images.doors.left = `assets/images/elevator/${name}`,
  image_elevator_doors_right: (lift, name) => lift.elevator.images.doors.right = `assets/images/elevator/${name}`,
  image_elevator_walls: (lift, name) => lift.elevator.images.walls = `assets/images/elevator/${name}`,
  image_elevator_panel: (lift, name) => lift.elevator.images.panel = `assets/images/elevator/${name}`,
};


export async function GET(req: NextRequest) {
  try {
    const userId = "demoUser"; // позже возьмём из авторизации
    const basePath = path.join(process.cwd(), "Elevators", userId);

    if (!fs.existsSync(basePath)) {
      return NextResponse.json({ success: true, elevators: [] });
    }

    // Список всех папок лифтов
    const liftIds = fs.readdirSync(basePath);

    const elevators = liftIds.map((liftId) => {
      const jsonPath = path.join(basePath, liftId, "lift.json");
      if (fs.existsSync(jsonPath)) {
        const liftData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
        return {
          id: liftId,
          title: liftData.title,
          description: liftData.description,
          coursebot: liftData.coursebot,
        };
      }
      return { id: liftId, error: "Нет lift.json" };
    });

    return NextResponse.json({ success: true, elevators });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const floors = JSON.parse(formData.get("floors") as string);
    const coursebotEnabled = formData.get("coursebotEnabled") === "true";

    const liftId = uuid();
    const userId = "demoUser";
    const basePath = path.join(process.cwd(), "Elevators", userId, liftId);
    const assetsPath = path.join(process.cwd(), "public", "Elevators", userId, liftId);

    fs.mkdirSync(basePath, { recursive: true });
    fs.mkdirSync(path.join(assetsPath, "floors"), { recursive: true });
    fs.mkdirSync(path.join(assetsPath, "assets", "sounds"), { recursive: true });
    fs.mkdirSync(path.join(assetsPath, "assets", "images", "floors"), { recursive: true });
    fs.mkdirSync(path.join(assetsPath, "assets", "images", "elevator"), { recursive: true });

    const liftJson: LiftJson = {
      id: liftId,
      title: name,
      description,
      floors,
      coursebot: { enabled: coursebotEnabled, options: {} },
      elevator: {
        soundEffects: {
          doorOpen: null,
          doorClose: null,
          buttonClick: null,
          movement: { start: null, move: null, end: null },
        },
        images: {
          doors: { left: null, right: null },
          walls: null,
          panel: null,
        },
        doorConfig: {
          type: "central",
          direction: null,
          animation: {}
        },
        display: {
          type: "MLMLCD",
          options: {},
          allowedOptions: [],
        },
        buttonPanel: {
          blocks: [
            {
              type: 'floors',
              cols: 3,
              // rows: 3,
              buttons: [],
              position: {
                y: 480
              }
            },
            {
              type: 'actions',
              cols: 3,
              buttons: [
                {
                  type: 'action',
                  action: {
                    element: 'Elevator',
                    command: 'doorOpen',
                  },
                  blocked: false,
                  deletable: false,
                  styles: {
                    active: {
                      boxShadow: '0px 0px 11px 2px #0056ff87',
                      outline: '1px solid #0055ffff',
                    },
                    default: `/images/elevators/template/MLM-2023/buttons/button-door-open.png`,
                  }
                },
                {
                  type: 'empty',

                },
                {
                  type: 'action',
                  action: {
                    element: 'Elevator',
                    command: 'callService',
                  },
                  blocked: false,
                  deletable: false, // Кнопку вызова удалить нельзя
                  styles: {
                    active: {
                      boxShadow: '0px 0px 11px 2px #0056ff87',
                      outline: '1px solid #0055ffff',
                    },
                    default: `/images/elevators/template/MLM-2023/buttons/button-call-service.png`,
                  }
                },
                {
                  type: 'action',
                  action: {
                    element: 'Elevator',
                    command: 'doorClose',
                  },
                  blocked: false,
                  deletable: true, // Кнопка закрытия дверей необязательна, её можно удалить
                  styles: {
                    active: {
                      boxShadow: '0px 0px 11px 2px #0056ff87',
                      outline: '1px solid #0055ffff',
                    },
                    default: `/images/elevators/template/MLM-2023/buttons/button-door-close.png`,
                  }
                },
                {
                  type: 'empty',
                },
                {
                  type: 'action',
                  action: {
                    element: 'Elevator',
                    command: 'resetCalls',
                  },
                  blocked: false,
                  deletable: true,
                  styles: {
                    active: {
                      boxShadow: '0px 0px 11px 2px #0056ff87',
                      outline: '1px solid #0055ffff',
                    },
                    default: `/images/elevators/template/MLM-2023/buttons/button-reset-calls.png`,
                  }
                }
              ],
              position: {
                y: 550
              }
            }
          ]
        },
      },
    };

    floors.forEach((floor: Floor, idx: number) => {
      if (floors.length % 3 === 1) {
        if (idx === 0) {
          liftJson.elevator.buttonPanel.blocks[0].buttons.push({
            type: 'empty',
          });
        }
      }
      liftJson.elevator.buttonPanel.blocks[0].buttons.push({
        type: 'floor',
        destinationFloor: idx,
        blocked: false,
        styles: {
          active: {
            boxShadow: '0px 0px 11px 2px #0056ff87',
            outline: '1px solid #0055ffff',
          },
          default: `/images/elevators/template/MLM-2023/buttons/button-floor-${String(idx + 1).padStart(2, '0')}.png`,
        }
      });
      if (floors.length % 3 === 1) {
        if (idx === 0) {
          liftJson.elevator.buttonPanel.blocks[0].buttons.push({
            type: 'empty',
          });
        }
      } else if (floors.length % 3 === 2) {
        if (idx === 0) {
          liftJson.elevator.buttonPanel.blocks[0].buttons.push({
            type: 'empty',
          });
        }
      }
    });

    liftJson.elevator.buttonPanel.blocks[0].buttons.reverse();
    // Маппинг для звуков
    const soundMap: Record<string, (lift: LiftJson, fileName: string) => void> = {
      sound_doorOpen: (lift, name) => (lift.elevator.soundEffects.doorOpen = `assets/sounds/${name}`),
      sound_doorClose: (lift, name) => (lift.elevator.soundEffects.doorClose = `assets/sounds/${name}`),
      sound_buttonClick: (lift, name) => (lift.elevator.soundEffects.buttonClick = `assets/sounds/${name}`),
      sound_moveStart: (lift, name) => (lift.elevator.soundEffects.movement.start = `assets/sounds/${name}`),
      sound_moveLoop: (lift, name) => (lift.elevator.soundEffects.movement.move = `assets/sounds/${name}`),
      sound_moveEnd: (lift, name) => (lift.elevator.soundEffects.movement.end = `assets/sounds/${name}`),
    };

    // Маппинг для изображений
    const imageMap: Record<string, (lift: LiftJson, fileName: string) => void> = {
      image_elevator_doors_left: (lift, name) => (lift.elevator.images.doors.left = `assets/images/elevator/${name}`),
      image_elevator_doors_right: (lift, name) => (lift.elevator.images.doors.right = `assets/images/elevator/${name}`),
      image_elevator_walls: (lift, name) => (lift.elevator.images.walls = `assets/images/elevator/${name}`),
      image_elevator_panel: (lift, name) => (lift.elevator.images.panel = `assets/images/elevator/${name}`),
    };

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        let targetDir: string;

        if (soundMap[key]) {
          soundMap[key](liftJson, value.name);
          targetDir = path.join(assetsPath, "assets", "sounds");
        } else if (imageMap[key]) {
          imageMap[key](liftJson, value.name);
          targetDir = path.join(assetsPath, "assets", "images", "elevator");
        } else if (key.startsWith("image_floor")) {
          targetDir = path.join(assetsPath, "assets", "images", "floors");
        } else {
          targetDir = path.join(assetsPath, "assets", "images");
        }

        fs.mkdirSync(targetDir, { recursive: true });
        fs.writeFileSync(path.join(targetDir, value.name), buffer);
      }
    }

    fs.writeFileSync(path.join(basePath, "lift.json"), JSON.stringify(liftJson, null, 2));
    return NextResponse.json({ success: true, liftId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}