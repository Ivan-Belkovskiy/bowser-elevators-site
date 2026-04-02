import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LiftJson, Floor, ElevatorButton, ButtonBlock, ElevatorButtonStyles, ElevatorDisplayConfig } from "@/types/elevator";
import { SavePayload } from "@/components/LevelBot/LevelBotModal";
import { PlayerState } from "@/components/MyLiftPlayer/MyLiftPlayer";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ← теперь мы ждём Promise
    const userId = "demoUser";

    const basePath = path.join(process.cwd(), "Elevators", userId, id);
    const jsonPath = path.join(basePath, "lift.json");

    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json(
        { success: false, error: "Лифт не найден" },
        { status: 404 }
      );
    }

    const liftData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    return NextResponse.json({ success: true, lift: liftData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = "demoUser"; // позже возьмём из авторизации

    const basePath = path.join(process.cwd(), "Elevators", userId, id);
    const assetsPath = path.join(process.cwd(), "public", "Elevators", userId, id);
    const jsonPath = path.join(basePath, "lift.json");

    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json(
        { success: false, error: "Лифт не найден" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    let liftData: LiftJson = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const floors = formData.get("floors")
      ? JSON.parse(formData.get("floors") as string)
      : null;
    const coursebotEnabled = formData.get("coursebotEnabled")
      ? formData.get("coursebotEnabled") === "true"
      : null;

    if (name) liftData.title = name;
    if (description) liftData.description = description;
    if (floors) liftData.floors = floors;
    if (coursebotEnabled !== null) liftData.coursebot.enabled = coursebotEnabled;

    const soundMap: Record<string, (lift: LiftJson, fileName: string) => void> = {
      sound_doorOpen: (lift, name) => (lift.elevator.soundEffects.doorOpen = `/Elevators/${userId}/${liftData.id}/assets/sounds/${name}`),
      sound_doorClose: (lift, name) => (lift.elevator.soundEffects.doorClose = `/Elevators/${userId}/${liftData.id}/assets/sounds/${name}`),
      sound_buttonClick: (lift, name) => (lift.elevator.soundEffects.buttonClick = `/Elevators/${userId}/${liftData.id}/assets/sounds/${name}`),
      sound_moveStart: (lift, name) => (lift.elevator.soundEffects.movement.start = `/Elevators/${userId}/${liftData.id}/assets/sounds/${name}`),
      sound_moveLoop: (lift, name) => (lift.elevator.soundEffects.movement.move = `/Elevators/${userId}/${liftData.id}/assets/sounds/${name}`),
      sound_moveEnd: (lift, name) => (lift.elevator.soundEffects.movement.end = `/Elevators/${userId}/${liftData.id}/assets/sounds/${name}`),
    };

    const imageMap: Record<string, (lift: LiftJson, fileName: string) => void> = {
      image_elevator_doors_left: (lift, name) => (lift.elevator.images.doors.left.url = `/Elevators/${userId}/${liftData.id}/assets/images/elevator/${name}`),
      image_elevator_doors_right: (lift, name) => (lift.elevator.images.doors.right.url = `/Elevators/${userId}/${liftData.id}/assets/images/elevator/${name}`),
      image_elevator_walls_left: (lift, name) => (lift.elevator.images.walls.left.url = `/Elevators/${userId}/${liftData.id}/assets/images/elevator/${name}`),
      image_elevator_walls_right: (lift, name) => (lift.elevator.images.walls.right.url = `/Elevators/${userId}/${liftData.id}/assets/images/elevator/${name}`),
      image_elevator_panel: (lift, name) => (lift.elevator.images.panel.url = `/Elevators/${userId}/${liftData.id}/assets/images/elevator/${name}`),
    };

    if (formData.has('completed_video_id')) {
      const videoId = formData.get('completed_video_id')
      if (typeof videoId === 'string') {
        if (!liftData.videoStats[videoId]) {
          liftData.videoStats[videoId] = {
            views: 1,
            watchHistory: [],
          }
        } else {
          liftData.videoStats[videoId].views += 1;
        }

        if (!liftData.videoStats[videoId].watchHistory) liftData.videoStats[videoId].watchHistory = [];

        const data = formData.get('video_player_state');

        if (typeof data === 'string') {
          const playerState: PlayerState = JSON.parse(data);
          if (playerState.watchInfo?.startDate && playerState.watchInfo?.endDate) liftData.videoStats[videoId].watchHistory.push({
            start: playerState.watchInfo.startDate,
            end: playerState.watchInfo.endDate,
            watchTime: playerState.duration,
            completed: true,
          });
        }
      }
    } else if (formData.has('coursebot__autosave')) {
      const data = formData.get('coursebot__autosave');
      const state = formData.get('coursebot__autosave--player_state');
      if ((data && typeof data === 'string') && (state && typeof state === 'string')) {
        const slotData = JSON.parse(data);
        const playerState = JSON.parse(state);

        if (playerState satisfies PlayerState) {
          const base64 = slotData.thumbnailUrl.replace(/^data:image\/png;base64,/, "");
          const targetPath = path.join(
            assetsPath,
            "assets",
            "images",
            "coursebot",
            slotData.videoId,
            `AUTOSAVE.png`
          );

          fs.mkdirSync(path.dirname(targetPath), { recursive: true });

          fs.writeFileSync(targetPath, Buffer.from(base64, "base64"));

          liftData.coursebot.slots[slotData.floorId].autosave = {
            isAutosave: true,
            data: {
              main: {
                id: 0,
                empty: false,
                ...slotData,
                thumbnailUrl: `/Elevators/${userId}/${liftData.id}/assets/images/coursebot/${slotData.videoId}/AUTOSAVE.png`,
                createdAt: new Date().toLocaleString().replace(',', ''),
              },
              playerState: playerState,
            }
          }
        }
      }
    } else if (formData.has('coursebot__edit_fragment')) {
      const data = formData.get('coursebot__edit_fragment');
      if (data && typeof data === 'string') {
        const slotData = JSON.parse(data);

        liftData.coursebot.slots[slotData.floorId].fragments[slotData.slotId] = {
          ...liftData.coursebot.slots[slotData.floorId].fragments[slotData.slotId],
          ...slotData,
        }
      }
    } else if (formData.has('coursebot__autosave_clear')) {
      const data = formData.get('coursebot__autosave_clear');
      if (data && typeof data === 'string') {
        const floorId: string = data;

        // liftData.coursebot.slots[floorId].autosave = {
        //   // id: 0,
        //   empty: true,
        // }
        liftData.coursebot.slots[floorId].autosave = undefined;
      }
    } else if (formData.has('coursebot__delete_fragment')) {
      const data = formData.get('coursebot__delete_fragment');
      if (data && typeof data === 'string') {
        const slotData = JSON.parse(data);

        liftData.coursebot.slots[slotData.floorId].fragments[slotData.slotId] = {
          isAutosave: false,
          data: {
            id: slotData.slotId,
            empty: true
          }
        }
      }
    } else if (formData.has('coursebot__save_fragment')) {
      const data = formData.get('coursebot__save_fragment');
      if (data && typeof data === 'string') {
        const payload: SavePayload & { title: string; slotIndex: number } = JSON.parse(data);
        const base64 = payload.thumbnailUrl.replace(/^data:image\/png;base64,/, "");
        const targetPath = path.join(
          assetsPath,
          "assets",
          "images",
          "coursebot",
          payload.videoId,
          `slot_${payload.slotIndex}.png`
        );

        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        fs.writeFileSync(targetPath, Buffer.from(base64, "base64"));


        liftData.coursebot.slots[payload.floorId].fragments[payload.slotIndex] = {
          isAutosave: false,
          data: {
            id: payload.slotIndex,
            title: payload.title,
            empty: false,
            createdAt: new Date().toLocaleString().replace(',', ''),
            thumbnailUrl: `/Elevators/${userId}/${liftData.id}/assets/images/coursebot/${payload.videoId}/slot_${payload.slotIndex}.png`,
            timecode: payload.timecode,
          }
        }
      }
    } else if (formData.has('updated_lift_json')) {
      for (const [key, value] of formData.entries()) {


        if (key === 'updated_lift_json') {
          const newData = formData.get('updated_lift_json');
          if (newData && typeof newData === 'string') {
            const updatedLiftData = JSON.parse(newData);
            if (updatedLiftData satisfies LiftJson) {
              liftData = updatedLiftData;
            }
          }
        } else if (key.startsWith('image_floor') && value instanceof File) {
          const floorIdx = Number(key.replace(/\D/g, ''));
          const buffer = Buffer.from(await value.arrayBuffer());
          const targetDir = path.join(assetsPath, "assets", "images", "floors");
          fs.mkdirSync(targetDir, { recursive: true });
          fs.writeFileSync(path.join(targetDir, value.name), buffer);
          if (liftData.floors[floorIdx].videoData) liftData.floors[floorIdx].videoData.image = `/Elevators/${userId}/${liftData.id}/assets/images/floors/${value.name}`;
        } else if (soundMap[key] && value instanceof File) {
          soundMap[key](liftData, value.name);
          const targetDir = path.join(assetsPath, "assets", "sounds");
          const buffer = Buffer.from(await value.arrayBuffer());

          fs.mkdirSync(targetDir, { recursive: true });
          fs.writeFileSync(path.join(targetDir, value.name), buffer);
        }


      }
    } else if (formData.has('updated_display_data') && typeof formData.get('updated_display_data') === 'string') {
      const updated = formData.get('updated_display_data');
      if (updated && typeof updated === 'string') {
        const data: ElevatorDisplayConfig = JSON.parse(updated);
        liftData.elevator.display = data;
      }

    } else if (formData.has('updated_button_data') && typeof formData.get('updated_button_data') === 'string') {

      const updatedButtonRaw = formData.get("updated_button_data");
      if (updatedButtonRaw && typeof updatedButtonRaw === "string") {
        const newButton = JSON.parse(updatedButtonRaw);
        const { blockIdx, buttonIdx, styleEditMode, buttonEditMode, data } = newButton;
        const button = liftData.elevator.buttonPanel.blocks[blockIdx].buttons[buttonIdx];

        if (button.type !== "empty") {
          const uploadedFile = formData.get("uploadedImage");

          if (styleEditMode === "image") {
            if (uploadedFile instanceof File) {
              const buffer = Buffer.from(await uploadedFile.arrayBuffer());
              const targetDir = path.join(assetsPath, "assets", "images", "elevator", "buttons");
              fs.mkdirSync(targetDir, { recursive: true });
              const filePath = path.join(targetDir, uploadedFile.name);
              fs.writeFileSync(filePath, buffer);

              button.styles[buttonEditMode as "default" | "active"] =
                `/Elevators/${userId}/${id}/assets/images/elevator/buttons/${uploadedFile.name}`;
            }
            if (button.type === "floor") {
              button.showFloorSymbol = false;
              if (data.destinationFloor !== null) {
                button.destinationFloor = parseInt(data.destinationFloor);
              }
            } else if (button.type === "action") {
              button.innerText = {
                on: false,
                text: "",
              };
            }
          }

          if (button.type === "action") {
            if (data.action !== null) button.action = data.action;
          }

          if (styleEditMode === "styles" && data.styles) {
            button.styles[buttonEditMode as "default" | "active"] = data.styles[styleEditMode];
            if (button.type === "action") {
              if (data.innerText !== null) button.innerText = data.innerText;
            }
            if (button.type === "floor") {
              if (data.showFloorSymbol !== null) {
                button.showFloorSymbol = data.showFloorSymbol;
              }
              if (data.destinationFloor !== null) {
                button.destinationFloor = parseInt(data.destinationFloor);
              }
            }
          }
        }
      }


    } else for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        let targetDir: string;

        if (soundMap[key]) {
          soundMap[key](liftData, value.name);
          targetDir = path.join(assetsPath, "assets", "sounds");
        } else if (imageMap[key]) {
          imageMap[key](liftData, value.name);
          targetDir = path.join(assetsPath, "assets", "images", "elevator");
        } else if (key.startsWith("image_floor")) {
          targetDir = path.join(assetsPath, "assets", "images", "floors");
        } else if (key.startsWith("button_image_")) {
          const parts = key.split("_");
          // ["button","image","block0","btn3","default"]
          const blockIdx = parseInt(parts[2].replace("block", ""));
          const btnIdx = parseInt(parts[3].replace("btn", ""));
          const mode = parts[4]; // "default" или "active"

          targetDir = path.join(assetsPath, "assets", "images", "elevator", "buttons");
          fs.mkdirSync(targetDir, { recursive: true });

          const filePath = path.join(targetDir, value.name);
          fs.writeFileSync(filePath, buffer);

          const button = liftData.elevator.buttonPanel.blocks[blockIdx].buttons[btnIdx];
          if (button.type !== "empty") {
            button.styles[mode as "default" | "active"] = `/Elevators/${userId}/${id}/assets/images/elevator/buttons/${value.name}`;
            if (button.type === 'floor') {
              button.showFloorSymbol = false;
              const destinationFloor = formData.get("button_destination_floor");
              if (destinationFloor) button.destinationFloor = parseInt(destinationFloor as string);
            }
          }
        }
        else {
          targetDir = path.join(assetsPath, "assets", "images");
        }

        fs.mkdirSync(targetDir, { recursive: true });
        fs.writeFileSync(path.join(targetDir, value.name), buffer);
      } else if (key === "button_style_data") {
        const blockIdx = parseInt(formData.get("button_style_block") as string);
        const btnIdx = parseInt(formData.get("button_style_index") as string);
        const mode = formData.get("button_style_mode") as "default" | "active";
        const showFloorSymbol = formData.get("button_show_symbol");
        const styleData = JSON.parse(value as string);

        const button = liftData.elevator.buttonPanel.blocks[blockIdx].buttons[btnIdx];
        if (button.type !== "empty") {
          button.styles[mode] = styleData;
          if (button.type === 'floor') {
            button.showFloorSymbol = Boolean(showFloorSymbol);
            if (formData.get("button_destination_floor")) button.destinationFloor = parseInt(formData.get("button_destination_floor") as string);
          }
        }
      }

    }

    fs.writeFileSync(jsonPath, JSON.stringify(liftData, null, 2));

    return NextResponse.json({ success: true, lift: liftData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = "demoUser"; // позже возьмём из авторизации

    const basePath = path.join(process.cwd(), "Elevators", userId, id);

    if (!fs.existsSync(basePath)) {
      return NextResponse.json(
        { success: false, error: "Лифт не найден" },
        { status: 404 }
      );
    }

    // Удаляем папку рекурсивно
    fs.rmSync(basePath, { recursive: true, force: true });

    return NextResponse.json({ success: true, message: `Лифт ${id} удалён` });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}