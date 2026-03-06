import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LiftJson, Floor, ElevatorButton, ButtonBlock, ElevatorButtonStyles, ElevatorDisplayConfig } from "@/types/elevator";

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
    const liftData: LiftJson = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    // Обновляем текстовые поля
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
      sound_doorOpen: (lift, name) => (lift.elevator.soundEffects.doorOpen = `assets/sounds/${name}`),
      sound_doorClose: (lift, name) => (lift.elevator.soundEffects.doorClose = `assets/sounds/${name}`),
      sound_buttonClick: (lift, name) => (lift.elevator.soundEffects.buttonClick = `assets/sounds/${name}`),
      sound_moveStart: (lift, name) => (lift.elevator.soundEffects.movement.start = `assets/sounds/${name}`),
      sound_moveLoop: (lift, name) => (lift.elevator.soundEffects.movement.move = `assets/sounds/${name}`),
      sound_moveEnd: (lift, name) => (lift.elevator.soundEffects.movement.end = `assets/sounds/${name}`),
    };

    const imageMap: Record<string, (lift: LiftJson, fileName: string) => void> = {
      image_elevator_doors_left: (lift, name) => (lift.elevator.images.doors.left = `assets/images/elevator/${name}`),
      image_elevator_doors_right: (lift, name) => (lift.elevator.images.doors.right = `assets/images/elevator/${name}`),
      image_elevator_walls: (lift, name) => (lift.elevator.images.walls = `assets/images/elevator/${name}`),
      image_elevator_panel: (lift, name) => (lift.elevator.images.panel = `assets/images/elevator/${name}`),
    };

    if (formData.has('updated_display_data') && typeof formData.get('updated_display_data') === 'string') {
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
          // например: button_image_block0_btn3_default
          const parts = key.split("_");
          // ["button","image","block0","btn3","default"]
          const blockIdx = parseInt(parts[2].replace("block", ""));
          const btnIdx = parseInt(parts[3].replace("btn", ""));
          const mode = parts[4]; // "default" или "active"

          targetDir = path.join(assetsPath, "assets", "images", "elevator", "buttons");
          fs.mkdirSync(targetDir, { recursive: true });

          const filePath = path.join(targetDir, value.name);
          fs.writeFileSync(filePath, buffer);

          // обновляем конкретную кнопку в lift.json
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

    // Сохраняем обновлённый lift.json
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