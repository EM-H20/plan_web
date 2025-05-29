/**
 * markerObj로 받아온 위치 정보 로컬 스토리지에 저장하는 함수
 */
function saveMarkerToLocalStorage(markerObj) {
    // 1. localStorage에 기존 데이터 불러오기
    let markers = JSON.parse(localStorage.getItem("markers")) || [];
    markers.push(markerObj);
  
    // 2. localStorage에 저장
    localStorage.setItem("markers", JSON.stringify(markers));
  
    // 3. 알림 및 입력창 숨기기(선택)
    //alert('저장 완료!');
    //document.getElementById('inputArea').style.display = 'none'; // 필요시
  }
  
  // localstorage에 있는 정보를 컴포넌트에 띄위기
  
  //import React, { useState } from "react";
  
  document.getElementById("showSaveBtn").onclick = function () {
    // 1. localStorage에서 데이터 불러오기
    const markers = JSON.parse(localStorage.getItem("markers")) || [];
    const area = document.getElementById("saveListArea");
    area.innerHTML = ""; // 기존 내용 지우기
  
    // 2. 데이터가 없으면 안내 메시지
    if (markers.length === 0) {
      area.innerHTML = "<p>저장된 장소가 없습니다.</p>";
      return;
    }
  
    // 3. 데이터가 있으면 리스트로 출력
    const ul = document.createElement("ul");
    markers.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `[${item.name}] ${item.address} (위도:${item.lat}, 경도:${item.lng})`;
      ul.appendChild(li);
    });
    area.appendChild(ul);
  };
  
  document.getElementById("saveBtn").onclick = saveMarkerToLocalStorage;