// "use server";

// export async function generateImage(text: string) {
//   try {
//     const response = await fetch(`http://localhost:3000/api/generate-image`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-API-SECRET": process.env.API_SECRET || "",
//       },
//       body: JSON.stringify({ text }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     throw error;
//   }
// }
// src/app/actions/generateImage.ts
"use server";

export async function generateImage(text: string) {
  const startTime = Date.now();
  try {
    const response = await fetch(`http://localhost:3000/api/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-SECRET": process.env.API_SECRET || "",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    throw error;
  }
}
