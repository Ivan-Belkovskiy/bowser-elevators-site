import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Floor {
  id: string;
  displaySymbol: string;
  videoData?: {
    title: string;
    image?: string;
    url?: string;
  };
}

interface LiftJson {
  id: string;
  title: string;
  description: string;
  floors: Floor[];
  coursebot: { enabled: boolean };
  elevator: {
    soundEffects: {
      doorOpen: string | null;
      doorClose: string | null;
      buttonClick: string | null;
      movement: {
        start: string | null;
        move: string | null;
        end: string | null;
      };
    };
    images: {
      doors: { left: string | null; right: string | null };
      walls: string | null;
      panel: string | null;
      button: string | null;
    };
  };
}

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
      image_elevator_button: (lift, name) => (lift.elevator.images.button = `assets/images/elevator/${name}`),
    };

    // Обработка файлов
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        let targetDir: string;

        if (soundMap[key]) {
          soundMap[key](liftData, value.name);
          targetDir = path.join(basePath, "assets", "sounds");
        } else if (imageMap[key]) {
          imageMap[key](liftData, value.name);
          targetDir = path.join(basePath, "assets", "images", "elevator");
        } else if (key.startsWith("image_floor")) {
          targetDir = path.join(basePath, "assets", "images", "floors");
        } else {
          targetDir = path.join(basePath, "assets", "images");
        }

        fs.mkdirSync(targetDir, { recursive: true });
        fs.writeFileSync(path.join(targetDir, value.name), buffer);
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