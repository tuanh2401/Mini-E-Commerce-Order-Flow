import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import axios from "axios";

// Cache sản phẩm trong RAM server 5 phút để tăng tốc độ phản hồi tức thì
let cachedProducts = null;
let lastProductFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getOptimizedProductContext() {
  const now = Date.now();
  if (cachedProducts && now - lastProductFetchTime < CACHE_TTL_MS) {
    return cachedProducts;
  }

  try {
    const productResponse = await axios.get("http://localhost:8082/api/products?size=100", { timeout: 3000 });
    const products = productResponse.data?.data?.content || productResponse.data?.data || [];

    cachedProducts = products.map(p => {
      let specsShort = null;
      let summary = "";
      try {
        const parsed = typeof p.description === "string" ? JSON.parse(p.description) : p.description;
        if (parsed?.specs && typeof parsed.specs === "object") {
          // Lấy rút gọn 4 thông số chính để giảm token, tăng tốc độ xử lý
          specsShort = Object.entries(parsed.specs).slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(", ");
        }
        summary = parsed?.html_desc ? parsed.html_desc.replace(/<[^>]*>?/gm, "").trim().substring(0, 120) : "";
      } catch (e) {
        summary = (p.description || "").substring(0, 120);
      }

      return {
        id: p.id,
        name: p.name,
        price: `${Number(p.price || 0).toLocaleString("vi-VN")}đ`,
        stock: p.stock ?? "Còn hàng",
        category: p.categoryName || "Thiết bị",
        specs: specsShort,
        highlight: summary,
        link: `/product/${p.id}`
      };
    });

    lastProductFetchTime = now;
    return cachedProducts;
  } catch (productErr) {
    console.warn("Không thể tải kho hàng từ backend:", productErr.message);
    return cachedProducts || [];
  }
}

export async function POST(req) {
  try {
    const { messages, image } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Không tìm thấy nội dung tin nhắn." }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = String(lastMessage.content || "").trim();

    // 1. Lấy dữ liệu sản phẩm (đã cache & tối ưu token)
    const productContext = await getOptimizedProductContext();

    // 2. Thiết lập quy chuẩn tư vấn chuyên nghiệp, khoa học, súc tích
    const systemInstruction = `
      Bạn là Chuyên gia Tư vấn Công nghệ & Bán hàng chuyên nghiệp của hệ thống "DungThamMobile".

      DANH SÁCH SẢN PHẨM HIỆN CÓ TẠI CỬA HÀNG:
      ${JSON.stringify(productContext)}

      TIÊU CHUẨN TƯ VẤN KHOA HỌC & TỐC ĐỘ:
      1. PHƯƠNG PHÁP TƯ VẤN KHOA HỌC & SÚC TÍCH:
         - Phân tích ngắn gọn dựa trên 3 trụ cột kỹ thuật:
           + (a) HIỆU NĂNG XỬ LÝ (Chip CPU, RAM, khả năng đa nhiệm và chơi game).
           + (b) MÀN HÌNH & THIẾT KẾ (Kích thước, độ phân giải, độ sáng, vật liệu).
           + (c) CAMERA & PIN (Cảm biến, zoom, thời lượng pin và sạc nhanh).
         - SO SÁNH ĐỐI CHIẾU: Khi có 2 hoặc nhiều sản phẩm tương đương tầm giá, chỉ ra rõ điểm hơn/kém.
         - KẾT LUẬN RÕ RÀNG: Đưa ra lời khuyên cụ thể khách hàng nào nên chọn máy nào.
         - Trả lời súc tích, đi thẳng vào trọng tâm trong khoảng 300 - 600 từ, tránh viết dài lê thê.

      2. NGUYÊN TẮC VỀ LINK SẢN PHẨM (BẮT BUỘC):
         - Mỗi khi đề cập hoặc gợi ý bất kỳ sản phẩm nào, BẮT BUỘC chèn kèm đường link xem sản phẩm theo cú pháp Markdown:
           👉 [Xem chi tiết {Tên sản phẩm}](/product/{id})
           (Ví dụ: 👉 [Xem chi tiết iPhone 15 Pro Max 256GB](/product/1))
         - Đặt link ngay dưới phần giới thiệu sản phẩm.

      3. CHÍNH SÁCH BẢO HÀNH & HẬU MÃI CỦA DUNGTHAMMOBILE (BẮT BUỘC TUÂN THỦ):
         - Khi khách hỏi về bảo hành, đổi trả, sửa chữa hoặc hậu mãi, trả lời chính xác 100% theo quy định sau:
           + Đối với MÁY MỚI (New / Seal): Đổi trả 1 - 1 trong 30 ngày đầu nếu lỗi nhà sản xuất, Bảo hành chính hãng 12 tháng.
           + Đối với MÁY CŨ (Like New / Đã qua sử dụng): Bao test 15 ngày lỗi 1 đổi 1, Bảo hành 3 tháng.
         - KÊNH HỖ TRỢ TRỰC TIẾP & KHUYẾN MÃI CHI TIẾT:
           Nếu khách hàng muốn biết thêm chi tiết về khuyến mãi độc quyền, thủ tục đổi trả hoặc hỗ trợ hậu mãi bảo hành, hướng dẫn khách liên hệ qua Zalo cửa hàng:
           👉 [Nhắn tin Zalo tư vấn & bảo hành: 0967.233.789](https://zalo.me/0967233789)

      4. HỖ TRỢ PHÂN TÍCH HÌNH ẢNH (NẾU CÓ ẢNH ĐÍNH KÈM):
         - Nếu khách hàng gửi ảnh (ảnh máy, ảnh cấu hình, ảnh máy bị hỏng, ảnh chụp sản phẩm mong muốn):
           Hãy nhận diện model máy trong ảnh, phân tích tình trạng hoặc đặc điểm, sau đó đối chiếu với các sản phẩm đang bán tại DungThamMobile để tư vấn máy tương đương hoặc giải pháp phù hợp.

      5. BẢO MẬT & QUY TẮC BẮT BUỘC:
         - CHỈ tư vấn sản phẩm có trong danh sách cửa hàng. Báo đúng mức giá chính thức của DungThamMobile.
         - Nếu sản phẩm có stock = 0, thông báo rõ là hiện đang tạm hết hàng.
         - Xưng hô lịch thiệp: "em" - "anh/chị". Giọng văn chuyên môn, tự tin, khách quan.
         - CÂU HỎI NGOÀI LUỒNG: Từ chối lịch thiệp nếu hỏi ngoài lĩnh vực công nghệ.
    `;

    // Chuẩn bị phần hình ảnh nếu người dùng đính kèm
    let imagePart = null;
    if (image && typeof image === "string" && image.includes("base64,")) {
      const [header, base64Data] = image.split("base64,");
      const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
      imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data.trim()
        }
      };
    }

    // 3. ƯU TIÊN 1: Google Gemini (Hỗ trợ Vision + Multi-model fallback)
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const GEMINI_MODELS = [
        "gemini-flash-lite-latest",
        "gemini-3.5-flash-lite",
        "gemini-3.6-flash",
        "gemini-3.8-flash"
      ];

      const historyMessages = messages.slice(0, -1).filter(m => m && m.content && String(m.content).trim() !== "");
      const firstUserIndex = historyMessages.findIndex(m => m.role === "user");
      const history = firstUserIndex !== -1
        ? historyMessages.slice(firstUserIndex).map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: String(m.content) }]
          }))
        : [];

      for (const modelName of GEMINI_MODELS) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1800, // Tối ưu để phản hồi nhanh chóng
            }
          });

          const chat = model.startChat({ history });
          
          // Gửi kèm image nếu có
          const sendParts = [];
          if (imagePart) {
            sendParts.push(imagePart);
          }
          sendParts.push({ text: userQuery || (imagePart ? "Hãy nhận diện và phân tích ảnh này giúp em nhé" : "Tư vấn giúp em") });

          const result = await chat.sendMessage(sendParts);
          const reply = result.response.text();
          if (reply) {
            return Response.json({ content: reply });
          }
        } catch (geminiErr) {
          console.warn(`[Gemini Error] Model ${modelName} gặp sự cố (${geminiErr.message}). Đang chuyển model dự phòng...`);
        }
      }
    }

    // 4. ƯU TIÊN 2: OpenAI Fallback (gpt-4o-mini)
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const formattedMessages = [
          { role: "system", content: systemInstruction },
          ...messages.slice(0, -1).map(m => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content || "").trim()
          }))
        ];

        // Tin nhắn cuối cùng (kèm ảnh nếu có)
        if (image) {
          formattedMessages.push({
            role: "user",
            content: [
              { type: "text", text: userQuery || "Hãy phân tích ảnh này giúp tôi" },
              { type: "image_url", image_url: { url: image } }
            ]
          });
        } else {
          formattedMessages.push({
            role: "user",
            content: userQuery
          });
        }

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: formattedMessages,
          temperature: 0.2,
          max_tokens: 1500,
        });

        const reply = completion.choices[0]?.message?.content || "Dạ, em có thể giúp gì thêm cho anh/chị ạ?";
        return Response.json({ content: reply });
      } catch (openaiErr) {
        console.warn("[OpenAI Error]:", openaiErr.message);
      }
    }

    return Response.json(
      { error: "Hệ thống AI đang quá tải. Vui lòng thử lại sau giây lát!" },
      { status: 500 }
    );

  } catch (error) {
    console.error("Lỗi Chatbot AI:", error.message || error);
    return Response.json(
      { error: error.message || "Có lỗi xảy ra khi kết nối với trợ lý AI." },
      { status: 500 }
    );
  }
}