import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const userQuery = messages[messages.length - 1].content;

    // 1. Lấy danh sách sản phẩm thực tế từ Database
    const productResponse = await axios.get("http://localhost:8082/api/products?size=100");
    const products = productResponse.data?.data?.content || [];

    const productContext = products.map(p => ({
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.categoryName,
      description: p.description
    }));

    // 2. Định nghĩa System Instruction nghiêm ngặt
    const systemInstruction = `
      Bạn là Trợ lý Tư vấn Mua sắm độc quyền của cửa hàng "FPT Shop".

      DANH SÁCH SẢN PHẨM HỢP LỆ TRONG HỆ THỐNG:
      ${JSON.stringify(productContext, null, 2)}

      ĐIỀU KHOẢN VÀ QUY TẮC BẮT BUỘC (TUYỆT ĐỐI TUÂN THỦ):
      1. CHỈ tư vấn và giới thiệu các sản phẩm nằm trong "DANH SÁCH SẢN PHẨM HỢP LỆ TRONG HỆ THỐNG" được cung cấp phía trên.
      2. KHÔNG ĐƯỢC PHÉP giới thiệu bất kỳ sản phẩm nào khác ngoài danh sách (ví dụ: khách hỏi iPhone 15 nhưng trong danh sách không có thì không được tư vấn).
      3. KHÔNG ĐƯỢC PHÉP trả lời các câu hỏi ngoài luồng, không liên quan đến mua sắm sản phẩm của cửa hàng (ví dụ: các câu hỏi về thời tiết, công thức nấu ăn, toán học, lập trình, chính trị, danh nhân lịch sử...).
      4. Cách xử lý câu hỏi ngoài luồng: Nếu khách hàng hỏi bất kỳ câu hỏi nào ngoài phạm vi tư vấn sản phẩm có sẵn, hãy trả lời lịch sự theo mẫu sau: "Dạ, em là trợ lý mua sắm của FPT Shop, em chỉ có thể hỗ trợ anh/chị tư vấn các sản phẩm điện thoại và laptop đang có sẵn tại cửa hàng thôi ạ. Anh/chị có cần em tìm mẫu máy nào không ạ?".
    `;

    // 3. Gọi Gemini với cấu hình kiểm soát chặt chẽ
    const model = ai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemInstruction,
      // Cấu hình giảm tối đa độ sáng tạo để AI không bịa chuyện
      generationConfig: {
        temperature: 0.1, // Càng thấp AI càng nói chuyện dựa vào dữ liệu thật
        topP: 0.1,
        maxOutputTokens: 800,
      }
    });

    const historyMessages = messages.slice(0, -1).filter(m => m && m.content && String(m.content).trim() !== "");
    const firstUserIndex = historyMessages.findIndex(m => m.role === "user");
    const history = firstUserIndex !== -1
      ? historyMessages.slice(firstUserIndex).map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        }))
      : [];

    const chat = model.startChat({
      history: history
    });

    const result = await chat.sendMessage(userQuery);
    const responseText = result.response.text();

    return Response.json({ content: responseText });
  } catch (error) {
    console.error("Lỗi Chatbot AI:", error);
    return Response.json({ error: "Có lỗi xảy ra khi kết nối với trợ lý ảo." }, { status: 500 });
  }
}