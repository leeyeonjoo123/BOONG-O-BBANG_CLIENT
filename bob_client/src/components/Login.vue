<template>
  <div>
    <div id="naverIdLogin"></div>
    <!-- <button type="button" @click="naverLogout">로그아웃</button> -->
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

export default {
  components: {},
  data() {
    return {
      naverLogin: null,
    };
  },
  mounted() {
    this.naverLogin = new window.naver.LoginWithNaverId({
      clientId: "IapqRycG1ktrS42rWihn",
      //local개발 환경으로 callbackUrl 수정
      //callbackUrl: "http://boong-o-bbang.com/naverLogin",
      callbackUrl: "http://localhost:1024/naverLogin",
      isPopup: false,
    });
    this.naverLogin.init();

    const router = useRouter();
    this.naverLogin.getLoginStatus((status) => {
      if (!status) {
        this.naverLogin.authorize();
      }
    });

    this.naverLogin.getLoginStatus((status) => {
      if (status) {
        const user = this.naverLogin.user;
        const signInDto = {
          userNaverId: user.id,
          userEmail: user.userEmail,
        };
        const userValidateDto = {
          userNaverId: user.id,
        };
        const userDTO = {
          userId: user.id,
          userEmail: user.email,
          username: user.name,
          userMobile: user.mobile,
          userBirthYear: user.birthyear,
          userGender: user.gender,
          userPhoto: user.profile_image,
          userBirthday: user.birthday,
        };
        const accessToken = localStorage.getItem("Authorization");

        try {
          localStorage.setItem(
            "token",
            this.naverLogin.accessToken.accessToken
          );
          sessionStorage.setItem("userDTO", JSON.stringify(userDTO));

          axios
            .post("/api/users/validate", userValidateDto)
            .then((res) => {
              if (res.data) {
                axios
                  .post("/api/users/signin", signInDto, {
                    headers: {
                      Authorization: accessToken,
                    },
                  })
                  .then((res) => {
                    localStorage.setItem(
                      "Authorization",
                      res.headers.getAuthorization()
                    );
                    localStorage.setItem("userId", userDTO.userId);

                    router.push("main");
                  })
                  .catch((error) => {
                    //로그인 에러
                    //token이 없을 때 , 토큰 만료됐을때, 토큰이 잘못됐을 때
                    if (error.response.data == "ExpiredJwtException") {
                      localStorage.removeItem("Authorization");
                      axios.post("/api/users/signin", signInDto).then((res) => {
                        localStorage.setItem(
                          "Authorization",
                          res.headers.getAuthorization()
                        );
                        localStorage.setItem("userId", userDTO.userId);
                      });
                      location.reload();
                      router.push("main");
                    } else {
                      ElMessage({
                        message: "다시 로그인 하십시오.",
                        type: "error",
                        duration: 2000,
                      });
                      router.push("/");
                    }
                  });
              } else {
                router.push("signup");
              }
            })
            .catch((err) => {
              console.log("Login Validation Err : " + err.response.data);
            });
          //login 시도
        } catch {
          (err) => {
            console.log("LOGIN VUE ERROR : " + err.response);
          };
        }
      } else {
        console.log("callback 처리에 실패하였습니다.");
      }
    });
  },

  methods: {
    naverLogout() {
      const accessToken = this.naverLogin.accessToken.accessToken;
      console.log(accessToken);
      const url = `/oauth2.0/token?grant_type=delete&client_id=I0fXbGMKugcUoTHBS7cX&client_secret=4EfdKMCHCe&access_token=${accessToken}&service_provider=NAVER`;
      axios.get(url).then((res) => {
        console.log(res.data);
      });
    },
  },
};
</script>
