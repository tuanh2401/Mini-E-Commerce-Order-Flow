"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function AuthPage() {
  // Trạng thái tab đăng nhập / đăng ký
  const [activeTab, setActiveTab] = useState("login"); // login | register

  // Trạng thái chung
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form Đăng nhập
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form Đăng ký thường
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullname, setRegFullname] = useState("");
  const [regAge, setRegAge] = useState("");

  // Màn hình kích hoạt tài khoản bằng Token sau khi đăng ký
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

  // Màn hình Quên mật khẩu & Quên tên tài khoản
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState("forgot_password"); // "forgot_password" | "find_account"
  const [forgotStep, setForgotStep] = useState(1); // 1: Nhập Username -> 2: Nhập OTP & Mật khẩu mới
  const [forgotUsername, setForgotUsername] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [forgotOtpCode, setForgotOtpCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");

  // Quên tên tài khoản (Tìm Username theo Email / SĐT)
  const [findAccountIdentifier, setFindAccountIdentifier] = useState("");
  const [foundAccount, setFoundAccount] = useState(null);

  // Form hoàn thiện thông tin Social Login khi đăng nhập mạng xã hội lần đầu
  const [socialRegData, setSocialRegData] = useState(null); // { provider, token, email, fullname }
  const [socialRegUsername, setSocialRegUsername] = useState("");
  const [socialRegPassword, setSocialRegPassword] = useState("");
  const [socialRegFullname, setSocialRegFullname] = useState("");
  const [socialRegAge, setSocialRegAge] = useState("");
  const [socialRegPhone, setSocialRegPhone] = useState("");

  const API_GATEWAY = "http://localhost:8082/api";
  const GOOGLE_CLIENT_ID = "440920366975-0at000lue4btfnl1sahm3huhrmtui7nm.apps.googleusercontent.com";

  // Khởi chạy Facebook SDK trên trang Auth
  useEffect(() => {
    if (window.FB) return;
    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : '1550086973288137', // FB App ID
        cookie     : true,
        xfbml      : true,
        version    : 'v20.0'
      });
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/vi_VN/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  // Xử lý đăng nhập thường
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setErrorMsg("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await axios.post(`${API_GATEWAY}/auth/authenticate`, {
        username: loginUsername,
        password: loginPassword
      });
      handleAuthSuccess(response.data.data);
    } catch (err) {
      console.warn(err);
      setErrorMsg(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng ký thường
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword || !regFullname || !regAge) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await axios.post(`${API_GATEWAY}/auth/register`, {
        username: regUsername,
        email: regEmail,
        password: regPassword,
        fullname: regFullname,
        age: parseInt(regAge)
      });
      setSuccessMsg("Đăng ký thành công! Một mã kích hoạt đã được gửi tới email của bạn.");
      setIsVerifyingEmail(true);
    } catch (err) {
      console.warn(err);
      setErrorMsg(err.response?.data?.message || "Đăng ký tài khoản thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xác thực Token kích hoạt email
  const handleVerifyEmailSubmit = async (e) => {
    e.preventDefault();
    if (!verificationToken) {
      setErrorMsg("Vui lòng điền mã kích hoạt!");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.get(`${API_GATEWAY}/auth/verify?token=${verificationToken.trim()}`);
      setSuccessMsg("Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay.");
      setIsVerifyingEmail(false);
      setActiveTab("login");
      setVerificationToken("");
    } catch (err) {
      console.warn(err);
      setErrorMsg(err.response?.data?.message || "Mã kích hoạt không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  // 1. Gửi yêu cầu lấy mã OTP quên mật khẩu theo Username (Bước 1)
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotUsername.trim()) {
      setErrorMsg("Vui lòng nhập tên tài khoản (Username) của bạn!");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await axios.post(`${API_GATEWAY}/auth/forgot-password`, {
        username: forgotUsername.trim()
      });
      const data = res.data?.data;
      setMaskedEmail(data?.maskedEmail || "email liên kết");
      setSuccessMsg(res.data?.message || `Mã OTP đã được gửi đến email liên kết: ${data?.maskedEmail}`);
      setForgotStep(2); // Chuyển sang bước 2: Nhập OTP và Mật khẩu mới
    } catch (err) {
      console.warn(err);
      setErrorMsg(err.response?.data?.message || "Không tìm thấy tên tài khoản này trong hệ thống!");
    } finally {
      setLoading(false);
    }
  };

  // 2. Xác thực OTP và đặt lại mật khẩu mới (Bước 2)
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtpCode.trim() || !forgotNewPassword.trim() || !forgotConfirmPassword.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ mã OTP, mật khẩu mới và xác nhận mật khẩu!");
      return;
    }
    if (forgotNewPassword.trim().length < 6) {
      setErrorMsg("Mật khẩu mới phải có tối thiểu 6 ký tự!");
      return;
    }
    if (forgotNewPassword.trim() !== forgotConfirmPassword.trim()) {
      setErrorMsg("Mật khẩu xác nhận không khớp với mật khẩu mới!");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await axios.post(`${API_GATEWAY}/auth/reset-password`, {
        username: forgotUsername.trim(),
        otpCode: forgotOtpCode.trim(),
        newPassword: forgotNewPassword.trim()
      });
      setSuccessMsg(res.data?.message || "Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.");
      // Reset form và chuyển về tab đăng nhập sau 2 giây
      setTimeout(() => {
        setIsForgotPassword(false);
        setForgotStep(1);
        setForgotUsername("");
        setForgotOtpCode("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setActiveTab("login");
      }, 2000);
    } catch (err) {
      console.warn(err);
      setErrorMsg(err.response?.data?.message || "Xác thực thất bại. Mã OTP không đúng hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  // 3. Tìm tài khoản khi Quên Tên Đăng Nhập
  const handleFindAccountSubmit = async (e) => {
    e.preventDefault();
    if (!findAccountIdentifier.trim()) {
      setErrorMsg("Vui lòng nhập Email hoặc Số điện thoại đã đăng ký!");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setFoundAccount(null);
    try {
      const res = await axios.post(`${API_GATEWAY}/auth/find-account`, {
        identifier: findAccountIdentifier.trim()
      });
      setFoundAccount(res.data?.data);
    } catch (err) {
      console.warn(err);
      setErrorMsg(err.response?.data?.message || "Không tìm thấy tài khoản nào khớp với thông tin này!");
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập Google thành công
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const tokenVal = credentialResponse.credential;
      const response = await axios.post(`${API_GATEWAY}/auth/social-login`, {
        provider: "GOOGLE",
        token: tokenVal
      });

      const data = response.data.data;
      if (data.isNewUser) {
        setSocialRegData({
          provider: "GOOGLE",
          token: tokenVal,
          email: data.email || "",
          fullname: data.fullname || ""
        });
        setSocialRegUsername(data.email ? data.email.split("@")[0] : "");
        setSocialRegFullname(data.fullname || "");
      } else {
        handleAuthSuccess(data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Đăng nhập Google thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập Facebook
  const handleFacebookLogin = () => {
    if (!window.FB) {
      setErrorMsg("Facebook SDK chưa được tải xong. Hãy tải lại trang!");
      return;
    }
    window.FB.login(function(response) {
      if (response.authResponse) {
        setLoading(true);
        const accessToken = response.authResponse.accessToken;
        
        axios.post(`${API_GATEWAY}/auth/social-login`, {
          provider: "FACEBOOK",
          token: accessToken
        })
        .then(res => {
          const data = res.data.data;
          if (data.isNewUser) {
            setSocialRegData({
              provider: "FACEBOOK",
              token: accessToken,
              email: data.email || "",
              fullname: data.fullname || ""
            });
            setSocialRegUsername(data.email ? data.email.split("@")[0] : "");
            setSocialRegFullname(data.fullname || "");
          } else {
            handleAuthSuccess(data);
          }
        })
        .catch(err => {
          console.error(err);
          setErrorMsg(err.response?.data?.message || "Đăng nhập Facebook thất bại!");
        })
        .finally(() => setLoading(false));
      }
    }, { scope: 'public_profile' });
  };

  // Hoàn thiện đăng ký mạng xã hội
  const handleSocialRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!socialRegUsername || !socialRegFullname || !socialRegAge || !socialRegPassword || !socialRegPhone) {
      setErrorMsg("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await axios.post(`${API_GATEWAY}/auth/social-register`, {
        provider: socialRegData.provider,
        token: socialRegData.token,
        username: socialRegUsername,
        fullname: socialRegFullname,
        age: parseInt(socialRegAge),
        password: socialRegPassword,
        phone: socialRegPhone
      });
      setSocialRegData(null);
      handleAuthSuccess(response.data.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Lỗi hoàn tất đăng ký mạng xã hội!");
    } finally {
      setLoading(false);
    }
  };

  // Lưu token & chuyển hướng về trang chủ
  const handleAuthSuccess = (data) => {
    localStorage.setItem("accessToken", data.jwt);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("username", data.username);
    localStorage.removeItem("userAvatar"); // Xóa avatar cũ của phiên đăng nhập trước để Header tải lại từ /users/me
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.jwt}`;
    
    // Kiểm tra quyền từ token để tự động chuyển hướng
    let role = "";
    try {
      const payload = JSON.parse(atob(data.jwt.split(".")[1]));
      role = payload.role || payload.roles || "";
    } catch (e) {
      console.error("Lỗi giải mã token:", e);
    }

    if (role === "ADMIN" || role === "ROLE_ADMIN") {
      window.location.href = "/admin";
    } else if (role === "STAFF" || role === "ROLE_STAFF") {
      window.location.href = "/staff";
    } else {
      window.location.href = "/"; // Quay lại trang chủ
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="auth-layout">
        <div className="auth-card">
          
          {/* THẮT NÚT HOÀN THÀNH SOCIAL PROFILE */}
          {socialRegData ? (
            <div>
              <h2 className="auth-title">HOÀN THIỆN HỒ SƠ</h2>
              <p className="auth-subtitle">Tài khoản mạng xã hội mới liên kết lần đầu. Vui lòng cung cấp thêm thông tin để đồng bộ với hệ thống.</p>
              {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
              
              <form onSubmit={handleSocialRegisterSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label>Email liên kết</label>
                  <input type="text" value={socialRegData.email} disabled />
                </div>
                <div className="auth-input-group">
                  <label>Tên đăng nhập mới</label>
                  <input type="text" value={socialRegUsername} onChange={e => setSocialRegUsername(e.target.value)} required />
                </div>
                <div className="auth-input-group">
                  <label>Mật khẩu đăng nhập dự phòng</label>
                  <input type="password" value={socialRegPassword} onChange={e => setSocialRegPassword(e.target.value)} placeholder="Tạo mật khẩu cho tài khoản..." required />
                </div>
                <div className="auth-input-group">
                  <label>Họ và tên</label>
                  <input type="text" value={socialRegFullname} onChange={e => setSocialRegFullname(e.target.value)} required />
                </div>
                <div className="auth-input-group">
                  <label>Tuổi</label>
                  <input type="number" value={socialRegAge} onChange={e => setSocialRegAge(e.target.value)} min="1" max="120" required />
                </div>
                <div className="auth-input-group">
                  <label>Số điện thoại</label>
                  <input type="text" value={socialRegPhone} onChange={e => setSocialRegPhone(e.target.value)} required />
                </div>
                
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="button" className="btn-auth-secondary" onClick={() => setSocialRegData(null)} style={{ flex: 1 }}>Hủy</button>
                  <button type="submit" className="btn-auth-primary" style={{ flex: 2 }}>{loading ? "Đang xử lý..." : "Hoàn thành"}</button>
                </div>
              </form>
            </div>
          ) : isVerifyingEmail ? (
            /* MÀN HÌNH NHẬP MÃ KÍCH HOẠT TOKEN */
            <div>
              <h2 className="auth-title">KÍCH HOẠT TÀI KHOẢN</h2>
              <p className="auth-subtitle">Vui lòng nhập mã token nhận được từ hộp thư email của bạn.</p>
              {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
              {successMsg && <div className="auth-alert success">{successMsg}</div>}

              <form onSubmit={handleVerifyEmailSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label>Mã Token Kích hoạt</label>
                  <input 
                    type="text" 
                    value={verificationToken} 
                    onChange={e => setVerificationToken(e.target.value)} 
                    placeholder="Dán mã kích hoạt tại đây..." 
                    required 
                  />
                </div>
                <button type="submit" className="btn-auth-primary" style={{ marginTop: "20px" }}>
                  {loading ? "Đang xử lý..." : "Xác thực Kích hoạt"}
                </button>
                
                <div style={{ textAlign: "center", marginTop: "15px" }}>
                  <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setIsVerifyingEmail(false); }}>Quay lại đăng nhập</a>
                </div>
              </form>
            </div>
          ) : isForgotPassword ? (
            /* MÀN HÌNH QUÊN MẬT KHẨU & QUÊN TÀI KHOẢN */
            <div>
              {forgotMode === "find_account" ? (
                /* CHẾ ĐỘ 1: QUÊN TÊN TÀI KHOẢN (FIND ACCOUNT) */
                <div>
                  <h2 className="auth-title">TÌM TÊN TÀI KHOẢN</h2>
                  <p className="auth-subtitle">Nhập Email hoặc Số điện thoại đã đăng ký để tìm lại Tên đăng nhập (Username)</p>
                  {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
                  {successMsg && <div className="auth-alert success">{successMsg}</div>}

                  <form onSubmit={handleFindAccountSubmit} className="auth-form">
                    <div className="auth-input-group">
                      <label>Email hoặc Số điện thoại</label>
                      <input 
                        type="text" 
                        placeholder="VD: user1@gmail.com hoặc 0912345678" 
                        value={findAccountIdentifier} 
                        onChange={(e) => setFindAccountIdentifier(e.target.value)} 
                        required
                      />
                    </div>
                    <button type="submit" className="btn-auth-primary" disabled={loading} style={{ marginTop: "15px" }}>
                      {loading ? "Đang tìm kiếm..." : "Tìm tài khoản"}
                    </button>
                  </form>

                  {/* KẾT QUẢ TÌM THẤY TÀI KHOẢN */}
                  {foundAccount && (
                    <div style={{ marginTop: "20px", padding: "18px", background: "#f0fdf4", borderRadius: "10px", border: "1.5px solid #86efac", textAlign: "center" }}>
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>📧</div>
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: "#166534" }}>
                        ĐÃ GỬI TÊN TÀI KHOẢN VỀ EMAIL
                      </div>
                      <div style={{ fontSize: "13px", color: "#15803d", marginTop: "6px", lineHeight: "1.5" }}>
                        Thông tin Tên đăng nhập (Username) đã được gửi đến: <br/>
                        <strong style={{ fontSize: "14px", color: "#166534" }}>
                          {findAccountIdentifier.includes("@") ? findAccountIdentifier.trim() : foundAccount.maskedEmail}
                        </strong>
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                        Vui lòng kiểm tra hộp thư Gmail để xem Tên đăng nhập tài khoản của bạn.
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                        <button 
                          type="button" 
                          className="btn-auth-primary" 
                          onClick={() => {
                            setForgotMode("forgot_password");
                            setForgotStep(1);
                            setErrorMsg("");
                            setSuccessMsg("");
                          }}
                          style={{ flex: 1, padding: "10px", fontSize: "13px" }}
                        >
                          Lấy lại mật khẩu
                        </button>
                        <button 
                          type="button" 
                          className="btn-auth-secondary" 
                          onClick={() => {
                            setIsForgotPassword(false);
                            setActiveTab("login");
                            setErrorMsg("");
                            setSuccessMsg("");
                          }}
                          style={{ flex: 1, padding: "10px", fontSize: "13px" }}
                        >
                          Đăng nhập ngay
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setForgotMode("forgot_password"); setErrorMsg(""); setSuccessMsg(""); }}>
                      ← Quay lại Quên mật khẩu
                    </a>
                  </div>
                </div>
              ) : (
                /* CHẾ ĐỘ 2: QUÊN MẬT KHẨU (FORGOT PASSWORD THEO USERNAME) */
                <div>
                  <h2 className="auth-title">KHÔI PHỤC MẬT KHẨU</h2>
                  <p className="auth-subtitle">
                    {forgotStep === 1 
                      ? "Nhập tên tài khoản (Username) để nhận mã xác thực OTP qua Email liên kết" 
                      : "Nhập mã OTP 6 số từ hộp thư Gmail và đặt mật khẩu mới"}
                  </p>
                  {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
                  {successMsg && <div className="auth-alert success">{successMsg}</div>}

                  {forgotStep === 1 ? (
                    <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
                      <div className="auth-input-group">
                        <label>Tên đăng nhập (Username)</label>
                        <input 
                          type="text" 
                          placeholder="Nhập username của bạn..." 
                          value={forgotUsername} 
                          onChange={(e) => setForgotUsername(e.target.value)} 
                          required
                        />
                      </div>

                      <div style={{ textAlign: "right", marginTop: "6px" }}>
                        <a 
                          href="#" 
                          className="auth-link" 
                          onClick={(e) => { e.preventDefault(); setForgotMode("find_account"); setFindAccountIdentifier(""); setFoundAccount(null); setErrorMsg(""); setSuccessMsg(""); }}
                          style={{ fontSize: "13px", color: "#3b82f6" }}
                        >
                          Quên tên tài khoản?
                        </a>
                      </div>

                      <button type="submit" className="btn-auth-primary" disabled={loading} style={{ marginTop: "15px" }}>
                        {loading ? "Đang kiểm tra & gửi mã..." : "Tiếp tục"}
                      </button>
                      <div style={{ textAlign: "center", marginTop: "15px" }}>
                        <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setErrorMsg(""); setSuccessMsg(""); }}>
                          Quay lại Đăng nhập
                        </a>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPasswordSubmit} className="auth-form">
                      <div className="auth-input-group">
                        <label>Mã xác thực OTP (6 số)</label>
                        <input 
                          type="text" 
                          maxLength="6"
                          placeholder="Nhập mã 6 số gửi về Gmail..." 
                          value={forgotOtpCode} 
                          onChange={(e) => setForgotOtpCode(e.target.value)} 
                          autoComplete="one-time-code"
                          required
                        />
                      </div>
                      <div className="auth-input-group">
                        <label>Mật khẩu mới</label>
                        <input 
                          type="password" 
                          placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..." 
                          value={forgotNewPassword} 
                          onChange={(e) => setForgotNewPassword(e.target.value)} 
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      <div className="auth-input-group">
                        <label>Xác nhận mật khẩu mới</label>
                        <input 
                          type="password" 
                          placeholder="Nhập lại mật khẩu mới..." 
                          value={forgotConfirmPassword} 
                          onChange={(e) => setForgotConfirmPassword(e.target.value)} 
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      <button type="submit" className="btn-auth-primary" disabled={loading} style={{ marginTop: "15px" }}>
                        {loading ? "Đang xử lý..." : "Xác nhận & Đổi mật khẩu"}
                      </button>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                        <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setForgotStep(1); setForgotOtpCode(""); setForgotNewPassword(""); setForgotConfirmPassword(""); setErrorMsg(""); setSuccessMsg(""); }}>
                          ← Đổi tên tài khoản khác
                        </a>
                        <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setErrorMsg(""); setSuccessMsg(""); }}>
                          Đăng nhập
                        </a>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ THÔNG THƯỜNG */
            <div>
              {/* Tabs Chọn Đăng nhập / Đăng ký */}
              <div className="auth-tabs">
                <button 
                  className={`auth-tab-item ${activeTab === "login" ? "active" : ""}`}
                  onClick={() => { setActiveTab("login"); setErrorMsg(""); setSuccessMsg(""); }}
                >
                  Đăng nhập
                </button>
                <button 
                  className={`auth-tab-item ${activeTab === "register" ? "active" : ""}`}
                  onClick={() => { setActiveTab("register"); setErrorMsg(""); setSuccessMsg(""); }}
                >
                  Đăng ký
                </button>
              </div>

              {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
              {successMsg && <div className="auth-alert success">{successMsg}</div>}

              {activeTab === "login" ? (
                /* FORM ĐĂNG NHẬP */
                <form onSubmit={handleLoginSubmit} className="auth-form">
                  <div className="auth-input-group">
                    <label>Tên đăng nhập</label>
                    <input 
                      type="text" 
                      placeholder="Nhập username..." 
                      value={loginUsername} 
                      onChange={e => setLoginUsername(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Mật khẩu</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={loginPassword} 
                      onChange={e => setLoginPassword(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="auth-options">
                    <label className="auth-remember">
                      <input type="checkbox" /> Ghi nhớ đăng nhập
                    </label>
                    <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setForgotStep(1); setErrorMsg(""); setSuccessMsg(""); }}>Quên mật khẩu?</a>
                  </div>

                  <button type="submit" className="btn-auth-primary" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                  </button>

                  <div className="auth-divider">
                    <span>Hoặc đăng nhập bằng</span>
                  </div>

                  {/* Các nút bấm đăng nhập mạng xã hội */}
                  <div className="auth-social-buttons">
                    <div className="google-oauth-btn-wrapper">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setErrorMsg("Đăng nhập bằng Google lỗi!")}
                      />
                    </div>

                    <button type="button" onClick={handleFacebookLogin} className="btn-auth-facebook">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: "8px" }}>
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                      </svg>
                      Đăng nhập bằng Facebook
                    </button>
                  </div>
                </form>
              ) : (
                /* FORM ĐĂNG KÝ */
                <form onSubmit={handleRegisterSubmit} className="auth-form">
                  <div className="auth-input-group">
                    <label>Tên đăng nhập (Username)</label>
                    <input 
                      type="text" 
                      placeholder="Nhập tên tài khoản..." 
                      value={regUsername} 
                      onChange={e => setRegUsername(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Địa chỉ Email</label>
                    <input 
                      type="email" 
                      placeholder="vidu@gmail.com" 
                      value={regEmail} 
                      onChange={e => setRegEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Mật khẩu</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={regPassword} 
                      onChange={e => setRegPassword(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Họ và tên</label>
                    <input 
                      type="text" 
                      placeholder="Nhập họ tên đầy đủ..." 
                      value={regFullname} 
                      onChange={e => setRegFullname(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Tuổi</label>
                    <input 
                      type="number" 
                      placeholder="Tuổi..." 
                      value={regAge} 
                      onChange={e => setRegAge(e.target.value)}
                      min="1" max="120"
                      required 
                    />
                  </div>

                  <button type="submit" className="btn-auth-primary" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
