import React from "react";
import Modal from "react-modal";
import MapComponent from "./MapComponent";

// 접근성 설정을 위해 모달 루트 요소 설정
Modal.setAppElement("#root");

const LocationModal = ({ isOpen, onRequestClose, address }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        content: {
          top: "45%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          width: "50%", // 모달 너비 설정
          height: "70%", // 모달 높이 설정
          borderRadius: "0%",
        },
        overlay: {
          backgroundColor: "rgba(9, 9, 11, 0.5)", // 이 모달 인스턴스의 오버레이 배경색
          position: "fixed",
          zIndex: 30,
        },
      }}
      contentLabel="위치 보기 모달"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">지도 보기</h2>
        <button
          onClick={onRequestClose}
          className="text-gray-500 hover:text-gray-800"
        >
          X
        </button>
      </div>
      <MapComponent address={address} />
    </Modal>
  );
};

export default LocationModal;
