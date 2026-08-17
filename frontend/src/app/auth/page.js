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
      console.error(err);
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
      console.error(err);
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
      await axios.get(`${API_GATEWAY}/auth/verify?token=${verificationToken}`);
      setSuccessMsg("Tài khoản của bạn đã được kích hoạt thành công! Hãy đăng nhập.");
      setIsVerifyingEmail(false);
      setActiveTab("login");
      setVerificationToken("");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Mã kích hoạt không hợp lệ hoặc đã hết hạn!");
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
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.jwt}`;
    
    // Kiểm tra quyền từ token để tự động chuyển hướng
    let role = "";
    try {
      const payload = JSON.parse(atob(data.jwt.split(".")[1]));
      role = payload.role || payload.roles || "";
    } catch (e) {
      console.error("Lỗi giải mã token:", e);
    }

    if (role === "ADMIN") {
      window.location.href = "/admin";
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
                    <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); alert("Nếu quên mật khẩu, hãy đăng ký tài khoản mới hoặc kiểm tra token xác thực trong hòm thư email của bạn!"); }}>Quên mật khẩu?</a>
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
