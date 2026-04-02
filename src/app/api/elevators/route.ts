import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { LiftJson, ElevatorButton, ButtonBlock, Floor, CoursebotFloorSlotConfig, SlotData } from "@/types/elevator";

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
    const floors: Floor[] = JSON.parse(formData.get("floors") as string);
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

    // fs.writeFileSync(path.join(process.cwd(), 'LOG.txt'), JSON.stringify(floors, null, 4));
    // return;

    const coursebotButton: ElevatorButton = (coursebotEnabled) ? {
      type: 'action',
      action: {
        element: 'Coursebot',
        command: 'openDefaultMode',
      },
      blocked: false,
      deletable: false,
      styles: {
        active: {
          boxShadow: '0px 0px 11px 2px #0056ff87',
          outline: '1px solid #0055ffff',
        },
        default: `/images/elevators/template/MLM-2023/buttons/button-coursebot.png`,
      }
    } : {
      type: "empty",
    }

    const coursebotSlotConfig: {
      [floorId: string]: CoursebotFloorSlotConfig;
    } = {};

    floors.forEach((floor, idx) => {
      coursebotSlotConfig[floor.id] = {
        autosave: undefined,
        fragments: []
      };

      for (let i = 0; i < 51; i++) {
        coursebotSlotConfig[floor.id].fragments.push({
          isAutosave: false,
          data: {
            id: i,
            empty: true,
          }
        });
      }
    })

    const liftJson: LiftJson = {
      id: liftId,
      title: name,
      description,
      floors,
      coursebot: {
        enabled: coursebotEnabled,
        autosaveDelaySec: 30,
        autosaveInFullModeOnly: true, // По умолчанию = TRUE
        hiddenAutosave: false,
        slots: coursebotSlotConfig
      },
      videoStats: {},
      elevator: {
        soundEffects: {
          doorOpen: null,
          doorClose: null,
          buttonClick: null,
          movement: { start: null, move: null, end: null },
        },
        images: {
          doors: {
            left: {
              url: "",
            },
            right: {
              url: "",
            }
          },
          walls: {
            left: {
              url: "",
            },
            right: {
              url: "",
            }
          },
          panel: {
            url: "",
          },
        },
        doorConfig: {
          type: "central",
          direction: null,
          closeDelay: 4,
          animations: {
            open: {
              durationMs: 2000,
              curve: "linear",
              keyframes: []
            },
            close: {
              durationMs: 2000,
              curve: "linear",
              keyframes: []
            }
          }
        },
        motion: {
          up: {
            preDelayMs: 1000,
            accelMs: 700,
            speedMsPerFloor: 2000,
            decelMs: 800,
            postDelayMs: 1000,
            curve: "linear",
          },
          down: {
            preDelayMs: 1000,
            accelMs: 700,
            speedMsPerFloor: 2000,
            decelMs: 800,
            postDelayMs: 1000,
            curve: "linear",
          },
        },
        display: {
          type: "MLMLCD",
          options: {},
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
                coursebotButton,
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
      meta: {
        createdAt: new Date().toISOString(),
        version: 1.0
      }
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

    const soundMap: Record<string, (lift: LiftJson, fileName: string) => void> = {
      sound_doorOpen: (lift, name) => (lift.elevator.soundEffects.doorOpen = `/Elevators/${userId}/${liftId}/assets/sounds/${name}`),
      sound_doorClose: (lift, name) => (lift.elevator.soundEffects.doorClose = `/Elevators/${userId}/${liftId}/assets/sounds/${name}`),
      sound_buttonClick: (lift, name) => (lift.elevator.soundEffects.buttonClick = `/Elevators/${userId}/${liftId}/assets/sounds/${name}`),
      sound_moveStart: (lift, name) => (lift.elevator.soundEffects.movement.start = `/Elevators/${userId}/${liftId}/assets/sounds/${name}`),
      sound_moveLoop: (lift, name) => (lift.elevator.soundEffects.movement.move = `/Elevators/${userId}/${liftId}/assets/sounds/${name}`),
      sound_moveEnd: (lift, name) => (lift.elevator.soundEffects.movement.end = `/Elevators/${userId}/${liftId}/assets/sounds/${name}`),
    };

    const imageMap: Record<string, (lift: LiftJson, fileName: string) => void> = {
      image_elevator_doors_left: (lift, name) => (lift.elevator.images.doors.left.url = `/Elevators/${userId}/${liftId}/assets/images/elevator/${name}`),
      image_elevator_doors_right: (lift, name) => (lift.elevator.images.doors.right.url = `/Elevators/${userId}/${liftId}/assets/images/elevator/${name}`),
      image_elevator_walls_left: (lift, name) => (lift.elevator.images.walls.left.url = `/Elevators/${userId}/${liftId}/assets/images/elevator/${name}`),
      image_elevator_walls_right: (lift, name) => (lift.elevator.images.walls.right.url = `/Elevators/${userId}/${liftId}/assets/images/elevator/${name}`),
      image_elevator_panel: (lift, name) => (lift.elevator.images.panel.url = `/Elevators/${userId}/${liftId}/assets/images/elevator/${name}`),
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
          const floorIdx = Number(key.replace(/\D/g, ''));
          if (liftJson.floors[floorIdx].videoData) {
            liftJson.floors[floorIdx].videoData.image = `/Elevators/${userId}/${liftId}/assets/images/floors/${value.name}`;
          }
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