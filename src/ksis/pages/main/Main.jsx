import React, { useEffect, useState, useRef } from "react";
import ApexCharts from "apexcharts";
import {
  TOTAL_FILE_SIZE,
  VISIT,
  FILE_COUNT,
  SIGNAGE_STATUS,
} from "../../../constants/api_constant";
import fetcher from "../../../fetcher";
import axios from "axios";
import Loading from "../../components/Loading";

const Main = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const API_WS_URL = process.env.REACT_APP_API_WS_URL;

  const MAX_RETRIES = 5;
  let retryCount = 0;
  const socketRef = useRef(null);

  const [fileSize, setFileSize] = useState({});
  const [fileCount, setFileCount] = useState({});
  const [visitCount, setVisitCount] = useState([]);
  const [devices, setDevices] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadPage = async () => {
    try {
      const [responseFile, responseCount, responseVisit] = await Promise.all([
        fetcher.get(TOTAL_FILE_SIZE),
        fetcher.get(FILE_COUNT),
        fetcher.get(VISIT),
      ]);
      setFileSize(responseFile.data);
      setFileCount(responseCount.data);
      setVisitCount(responseVisit.data);

      loadDevice();

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const loadDevice = async () => {
    try {
      // const response = await axios.get(API_BASE_URL + SIGNAGE_STATUS);
      const response = await fetcher.get(SIGNAGE_STATUS);

      if (response.data) {
        setDevices(response.data);
      } else {
        console.error("No data property in response");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const connectWebSocket = () => {
    const socket = new WebSocket(API_WS_URL + `/ws/main`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      if (event.data === "statusUpdate") {
        loadDevice();
      }
    };

    socket.onopen = () => {
      console.log("WebSocket connected");
      retryCount = 0;
    };

    socket.onclose = () => {
      if (retryCount < MAX_RETRIES) {
        const retryTimeout = Math.pow(2, retryCount) * 1000; // 지수 백오프 적용
        console.log(
          `WebSocket disconnected. Reconnecting in ${
            retryTimeout / 1000
          } seconds...`
        );
        retryCount++;
        setTimeout(connectWebSocket, retryTimeout); // 재연결 시도
      } else {
        console.log("Max retries reached. No further reconnection attempts.");
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close(); // 컴포넌트 언마운트 시 WebSocket 종료
      }
    };
  }, []);

  //업로드 개수
  const optionsFileCount = {
    series: [
      fileCount.countImage,
      fileCount.countEncodedImage,
      fileCount.countVideo,
      fileCount.countEncodedVideo,
    ],
    labels: ["원본 이미지", "인코딩 이미지", "원본 영상", "인코딩 영상"],
    chart: {
      type: "donut",
      height: "450px",
      width: "100%",
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + "%";
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: function (w) {
                return w.globals.series
                  .filter((val) => val !== undefined && val !== null) // 필터링
                  .reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
    legend: {
      show: true,
      formatter: function (seriesName, opts) {
        // 안전하게 series 값을 참조
        const seriesValue = opts.w.globals.series[opts.seriesIndex];

        // 값이 없을 경우 0으로 처리
        return `${seriesName}: ${
          seriesValue !== undefined && seriesValue !== null
            ? seriesValue.toString()
            : 0
        }`;
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          // undefined나 null인 경우에 대해 안전하게 처리
          return val !== undefined && val !== null ? val.toString() : "0";
        },
      },
    },
  };

  //업로드 이미지 용량
  const optionsImage = {
    series: [
      {
        name: ["원본 이미지", "인코딩 이미지"],
        color: "#f9c74f",
        data: [
          {
            x: "원본 이미지",
            y: Math.round(fileSize.totalImageSize * 10 ** -6 * 100) / 100,
            fillColor: "#f9c74f",
          },
          {
            x: "인코딩 이미지",
            y:
              Math.round(fileSize.totalEncodedImageSize * 10 ** -6 * 100) / 100,
            fillColor: "#90be6d",
          },
        ],
      },
    ],
    chart: {
      type: "bar",
      height: 225,
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.25,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 0.85,
        opacityTo: 0.95,
        stops: [50, 100],
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        columnWidth: "80%",
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${val} MB`;
      },
      style: {
        fontFamily: "Inter, sans-serif",
        fontWeight: "bold",
        colors: ["#333"],
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (value) {
          return `${value} MB`;
        },
      },
    },
    xaxis: {
      labels: {
        style: {
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
      categories: ["원본 이미지(MB)", "인코딩 이미지(MB)"],
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      padding: {
        left: 10,
        right: 10,
      },
    },
  };
  //업로드 영상 용량
  const optionsVideo = {
    series: [
      {
        name: ["원본 영상", "인코딩 영상"],
        color: "#90be6d",
        data: [
          {
            x: "원본 영상",
            y: Math.round(fileSize.totalVideoSize * 10 ** -9 * 1000) / 1000,
            fillColor: "#f9c74f",
          },
          {
            x: "인코딩 영상",
            y:
              Math.round(fileSize.totalEncodedVideoSize * 10 ** -9 * 1000) /
              1000,
            fillColor: "#90be6d",
          },
        ],
      },
    ],
    chart: {
      type: "bar",
      height: 225,
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.25,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 0.85,
        opacityTo: 0.95,
        stops: [50, 100],
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        columnWidth: "80%",
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${val} GB`;
      },
      style: {
        fontFamily: "Inter, sans-serif",
        fontWeight: "bold",
        colors: ["#333"],
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (value) {
          return `${value} GB`;
        },
      },
    },
    xaxis: {
      labels: {
        style: {
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
      categories: ["원본 영상(GB)", "인코딩 영상(GB)"],
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      padding: {
        left: 10,
        right: 10,
      },
    },
  };
  //방문자
  const optionsVisit = visitCount.length
    ? {
        colors: ["#00cadc"],
        series: [
          {
            name: "방문자 수",
            color: "#00cadc",
            data: visitCount,
          },
        ],
        chart: {
          type: "line",
          height: "450px",
          fontFamily: "Inter, sans-serif",
          toolbar: {
            show: false,
          },
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 800,
          },
        },
        stroke: {
          show: true,
          width: 3,
          colors: ["#00cadc"],
          curve: "smooth",
        },
        tooltip: {
          shared: true,
          intersect: false,
          x: {
            format: "dd MMM", // 날짜 포맷 설정 가능
          },
          y: {
            formatter: function (val) {
              return val + "명";
            },
          },
          style: {
            fontFamily: "Inter, sans-serif",
          },
        },
        states: {
          hover: {
            filter: {
              type: "darken",
              value: 1,
            },
          },
        },
        grid: {
          show: true,
          borderColor: "#e7e7e7",
          strokeDashArray: 4,
          padding: {
            left: 10,
            right: 10,
          },
        },
        xaxis: {
          floating: false,
          labels: {
            show: true,
            rotate: -45, // X축 레이블 비스듬히 표시
            style: {
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
            },
          },
          axisBorder: {
            show: true,
            color: "#e7e7e7",
          },
          axisTicks: {
            show: true,
            color: "#e7e7e7",
          },
        },
        yaxis: {
          show: true,
          labels: {
            formatter: function (val) {
              return val.toFixed(0) + "명";
            },
            style: {
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        fill: {
          opacity: 1,
        },
      }
    : {};

  useEffect(() => {
    if (
      fileCount.countImage >= 0 &&
      fileCount.countVideo >= 0 &&
      fileCount.countEncodedImage >= 0 &&
      fileCount.countEncodedVideo >= 0
    ) {
      if (
        document.getElementById("count-chart") &&
        typeof ApexCharts !== "undefined"
      ) {
        const chart = new ApexCharts(
          document.getElementById("count-chart"),
          optionsFileCount
        );
        chart.render();
      }
    }

    if (visitCount.length > 0) {
      if (
        document.getElementById("visit-chart") &&
        typeof ApexCharts !== "undefined"
      ) {
        const chart = new ApexCharts(
          document.getElementById("visit-chart"),
          optionsVisit
        );
        chart.render();
      }
    }

    if (fileSize.totalImageSize >= 0 && fileSize.totalEncodedImageSize >= 0) {
      if (
        document.getElementById("image-chart") &&
        typeof ApexCharts !== "undefined"
      ) {
        const chart = new ApexCharts(
          document.getElementById("image-chart"),
          optionsImage
        );
        chart.render();
      }
    }

    if (fileSize.totalVideoSize >= 0 && fileSize.totalEncodedVideoSize >= 0) {
      if (
        document.getElementById("video-chart") &&
        typeof ApexCharts !== "undefined"
      ) {
        const chart = new ApexCharts(
          document.getElementById("video-chart"),
          optionsVideo
        );
        chart.render();
      }
    }
  }, [visitCount, fileCount, fileSize]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="grid md:grid-cols-2 grid-cols-1 gap-4 rounded-sm border-2 border-[#FCA929] p-10 w-full h-full">
      <div class="w-auto bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
        <div class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-5">
          이미지 및 영상 수
        </div>
        <div id="count-chart"></div>
      </div>
      <div class="w-auto bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
        <div class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-5">
          이미지 및 영상 사용량
        </div>
        <div id="image-chart"></div>
        <div id="video-chart"></div>
      </div>
      <div class="w-auto bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
        <div class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-5">
          재생 장치 상태
        </div>
        <div>
          <table className="min-w-full divide-y divide-gray-300 border-collapse border border-gray-300 mb-4">
            <thead>
              <tr>
                <th className="border border-gray-300 p-1">재생장치 이름</th>
                <th className="border border-gray-300 p-1">연결 상태</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr>
                  <td className="border border-gray-300 text-center p-2">
                    {device.deviceName}
                  </td>

                  <td className="border border-gray-300 text-center p-2">
                    {device.isConnect ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 inline-block"></div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-red-500 inline-block"></div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div class="w-auto bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
        <div class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-5">
          방문자 통계
        </div>
        <div id="visit-chart"></div>
      </div>
    </div>
  );
};

export default Main;
