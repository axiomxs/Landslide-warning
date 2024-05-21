import { proxy } from "valtio";
import axios from "axios";
import settings from "../../public/json/setting.json";
import citycode from "../../public/json/citycode.json";

export const weatherStore = proxy({
  ip: "",
  city: "",
  error: null,
  isLoading: false,
  cityCode: "",
  weatherInfo: null,
  getCity: async () => {
    try {
      weatherStore.isLoading = true; // 请求开始前设置加载状态为 true

      // 获取 IP 地址
      const ipResponse = await axios.get("https://api64.ipify.org?format=json");
      const ipAddress = ipResponse.data.ip;
      weatherStore.ip = ipAddress;

      // 获取地理位置信息
      const locationResponse = await axios.get(
        `https://ipapi.co/${ipAddress}/json/`
      );
      const locationData = locationResponse.data;
      weatherStore.city = locationData.city;

      // 查找省份和城市的 adcode
      const provinceData = citycode.find(
        (item) => item.province === locationData.region
      );
      if (provinceData) {
        const cityData = provinceData.city.find(
          (city) => city.name === locationData.city
        );
        if (cityData) {
          weatherStore.cityCode = cityData.adcode;
          // 使用城市代码发起获取天气信息的请求
          const weatherResponse = await axios.get(
            `https://restapi.amap.com/v3/weather/weatherInfo?key=${settings.adcode_key}&city=${weatherStore.cityCode}`
          );
          const weatherData = weatherResponse.data;
          weatherStore.weatherInfo = weatherData; // 存储天气信息
        } else {
          throw new Error("City not found in province data");
        }
      } else {
        throw new Error("Province not found in city code data");
      }
    } catch (error) {
      weatherStore.error = error.message; // 错误信息存入 error 状态中
    } finally {
      weatherStore.isLoading = false; // 请求结束后重置加载状态为 false
    }
  },
});