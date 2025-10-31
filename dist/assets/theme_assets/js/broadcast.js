document.addEventListener('DOMContentLoaded', function() {

    const popupBox = document.getElementById('sensor-detail-popup');
    const closeButton = document.getElementById('popup-close-btn');
    const popupSensorName = document.getElementById('popup-sensor-name');
    const popupSensorTime = document.getElementById('popup-sensor-time');
    const fixedDropdownElements = document.querySelectorAll('.dropdown-fixed');
    const headerDropdownToggles = document.querySelectorAll('.sensor-list-header .dropdown [data-bs-toggle="dropdown"]');
    const dataListItems = document.querySelectorAll('.analyze-data-list');
    const sensorCards = document.querySelectorAll('.sensor-modal-card');
    const allIntervalGroups = document.querySelectorAll('.broadcast-modal-interval-group');
    const lastBroadcastModal = document.getElementById('lastBroadcastModal');
    const confirmBroadcastBtn = document.querySelector('#lastBroadcastModal .last-broadcast-btn-confirm');
    const allCheckboxes = document.querySelectorAll('.sensor-modal-card .checkbox');
    const basicModal = document.getElementById('modal-basic');
    const basicModalInstance = bootstrap.Modal.getOrCreateInstance(basicModal);
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalInstance = bootstrap.Modal.getOrCreateInstance(confirmModal);
    const openConfirmBtn = document.getElementById('btn-open-confirm'); // '방송설정'의 확인 버튼
    const backToConfigBtn = document.getElementById('confirm-btn-back'); // '확인모달'의 다시설정 버튼
    const finalConfirmBtn = document.getElementById('confirm-btn-final'); // '확인모달'의 최종확인 버튼

    // 팝업 닫기 버튼 이벤트
    closeButton.addEventListener('click', function() {
        popupBox.classList.remove('show');
    });

    // 드롭다운 'fixed'
    fixedDropdownElements.forEach(function(element) {
        var toggleButton = element.querySelector('[data-bs-toggle="dropdown"]');
        new bootstrap.Dropdown(toggleButton, {
            popperConfig: {
                strategy: 'fixed'
            }
        });
    });

    headerDropdownToggles.forEach(function(currentToggle) {
        currentToggle.addEventListener('show.bs.dropdown', function(event) {
            headerDropdownToggles.forEach(function(otherToggle) {
                if (otherToggle !== event.target) {
                    const dropdownInstance = bootstrap.Dropdown.getInstance(otherToggle);
                    if (dropdownInstance) {
                        dropdownInstance.hide();
                    }
                }
            });
        });
    });

    // 드롭다운 닫기 버튼(취소/확인) 핫와이어링
    document.querySelectorAll('[data-bs-dismiss="dropdown"]').forEach(function(dismissButton) {
        dismissButton.addEventListener('click', function(event) {
            let dropdownWrapper = this.closest('.dropdown');
            if (dropdownWrapper) {
                let toggleButton = dropdownWrapper.querySelector('[data-bs-toggle="dropdown"]');
                if (toggleButton) {
                    let dropdownInstance = bootstrap.Dropdown.getInstance(toggleButton);
                    if (dropdownInstance) {
                        dropdownInstance.hide();
                    }
                }
            }
        });
    });

    // analyze-data-list 클릭 이벤트 (팝업 열기)
    dataListItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const collapseItem = this.closest('.dm-collapse-item');
            let sensorName = "센서 상세 정보";
            if (collapseItem) {
                const sensorNameElement = collapseItem.querySelector('.sensor-name');
                if (sensorNameElement) {
                    sensorName = sensorNameElement.textContent.trim();
                }
            }
            popupSensorName.textContent = sensorName;

            let sensorTime = "시간 정보없음";
            const timeElement = this.querySelector('.analyze-sensor-time');
            if (timeElement) {
                sensorTime = timeElement.textContent.trim();
            }
            popupSensorTime.textContent = sensorTime;
            popupBox.classList.add('show');
        });
    });

    // --- (모달 동기화 로직) ---
    // (즉시 실행) 페이지 로드 시, 'active' 버튼에 맞춰 체크박스 상태 동기화
    sensorCards.forEach(function(card) {
        const checkbox = card.querySelector('.checkbox');
        if (checkbox) {
            checkbox.checked = card.classList.contains('active');
        }
    });

    // 각 센서 카드(버튼)에 클릭 이벤트 추가
    sensorCards.forEach(function(card) {
        card.addEventListener('click', function(event) {
            if (!event.target.closest('.sensor-modal-checkmark')) {
                const checkbox = this.querySelector('.checkbox');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            }
        });
    });

    allCheckboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() { // 'this'는 방금 변경된 체크박스

            // 체크박스 상태에 따라 부모 카드의 'active' 클래스만 토글합니다.
            const parentCard = this.closest('.sensor-modal-card');
            if (parentCard) {
                parentCard.classList.toggle('active', this.checked);
            }

        });
    });

    // 체크박스/라벨 클릭 시, 이벤트가 부모(버튼)로 전파되는 것 중단
    document.querySelectorAll('.sensor-modal-checkmark').forEach(function(checkmarkArea) {
        checkmarkArea.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });

    allIntervalGroups.forEach(function(group) {

        const allButtonsInGroup = group.querySelectorAll('.broadcast-modal-btn');

        allButtonsInGroup.forEach(function(button) {
            button.addEventListener('click', function() {

                allButtonsInGroup.forEach(function(btn) {
                    btn.classList.remove('active');
                });

                this.classList.add('active');

                const buttonText = this.textContent.trim();
                console.log(buttonText + " 선택됨");
            });
        });
    });

    lastBroadcastModal.addEventListener('shown.bs.modal', function () {
        setTimeout(function() {
            try {
                const firstModal = document.querySelector('#modal-basic');
                const firstModalZIndex = parseInt(window.getComputedStyle(firstModal).zIndex, 10);

                if (firstModalZIndex) {
                    lastBroadcastModal.style.zIndex = firstModalZIndex + 10;

                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    if (backdrops.length > 0) {
                        backdrops[backdrops.length - 1].style.zIndex = firstModalZIndex + 9;
                    }
                }
            } catch (e) {
                console.error("모달 z-index 설정 중 오류 발생:", e);
                lastBroadcastModal.style.zIndex = '9999';
                const backdrops = document.querySelectorAll('.modal-backdrop');
                if (backdrops.length > 0) {
                    backdrops[backdrops.length - 1].style.zIndex = '9998';
                }
            }
        }, 50);
    });

    if (confirmBroadcastBtn) {
        confirmBroadcastBtn.addEventListener('click', function() {

            // 모달 내부에서 '선택된(checked)' 라디오 버튼 찾기
            const selectedRadio = document.querySelector('input[name="last-broadcast-radio"]:checked');

            // 선택된 항목이 있는지 확인
            if (selectedRadio) {
                // 5. 선택된 라디오 버튼의 '다음' 형제 요소인 <label> (목록 아이템)을 찾기
                const selectedLabel = selectedRadio.nextElementSibling;

                // 6. <label> 내부에서 메시지 텍스트가 담긴 .last-broadcast-col-message 요소를 찾기
                const messageElement = selectedLabel.querySelector('.last-broadcast-col-message');

                if (messageElement) {
                    // 7. 메시지 텍스트를 추출 (textContent.trim()으로 아이콘을 제외한 순수 텍스트만 가져옴)
                    const messageText = messageElement.textContent.trim();

                    // 8. '방송 설정 모달'(#modal-basic)에 있는 <textarea>를 찾기
                    const targetTextarea = document.querySelector('#modal-basic .sensor-modal-textarea');

                    if (targetTextarea) {
                        // 9. <textarea>의 'value'를 추출한 메시지 텍스트로 설정
                        targetTextarea.value = messageText;
                    }

                    // 10. 데이터를 성공적으로 전달했으므로 "지난 방송 모달"을 닫기
                    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('lastBroadcastModal'));
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                }
            } else {
                alert("불러올 항목을 선택해주세요.");
            }
        });
    }

    if (openConfirmBtn) {
        openConfirmBtn.addEventListener('click', function() {

            // --- (a) 선택된 센서 데이터 읽기 ---
            const confirmSensorList = document.getElementById('confirm-sensor-list');
            confirmSensorList.innerHTML = ''; // 기존 목록 초기화
            let sensorCount = 0;

            document.querySelectorAll('.sensor-modal-card.active').forEach(function(card) {
                const sensorName = card.querySelector('.sensor-name').textContent.trim();
                sensorCount++;

                // 확인 모달에 표시할 HTML 생성
                const sensorItemHTML = `
                        <div class="col-3">
                            <button type="button" class="sensor-corfirm-modal-card active sensor-modal-available">
                                <div class="sensor-icon-wrapper">
                                    <div class="sensor-icon active">
                                        <img src="img/sensor_icon/portable_icon.png" alt="센서아이콘" class="sensor-custom-icon">
                                    </div>
                                </div>
                                <div class="">
                                    <div class="sensor-status-icons">
                                        <i class="fas fa-signal"></i>
                                        <i class="fas fa-wifi"></i>
                                        <span>75%</span>
                                    </div>
                                    <div class="sensor-modal-info-wrapper">
                                        <div class="sensor-details">
                                            <span class="sensor-name">${sensorName}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                
                      `;
                confirmSensorList.innerHTML += sensorItemHTML;
            });

            // (유효성 검사) 센서가 1개도 선택되지 않았다면 중단
            if (sensorCount === 0) {
                alert('센서를 1개 이상 선택해주세요.');
                return; // 함수 종료
            }

            // --- (b) 방송 간격 데이터 읽기 ---
            let intervalText = '설정 안함';
            const activeIntervalBtn = document.querySelector('.broadcast-modal-btn.active');
            const confirmInterval = document.getElementById('confirm-broadcast-interval');

            if (activeIntervalBtn) {
                if (activeIntervalBtn.classList.contains('broadcast-modal-direct-btn')) {
                    // '직접설정'이 active일 때
                    const timeInputs = document.querySelectorAll('.broadcast-modal-time-inputs .broadcast-modal-time-input');
                    const hour = timeInputs[0].value || 0;
                    const min = timeInputs[1].value || 0;
                    const sec = timeInputs[2].value || 0;
                    intervalText = `${hour}시간 ${min}분 ${sec}초`;
                } else {
                    // '10초', '30초', '1분' 버튼일 때
                    intervalText = activeIntervalBtn.textContent.trim();
                }
            }
            confirmInterval.textContent = intervalText;

            // --- (c) 방송 메세지 데이터 읽기 ---
            const messageText = document.querySelector('.sensor-modal-textarea').value;
            const confirmMessage = document.getElementById('confirm-broadcast-message');

            if (messageText) {
                confirmMessage.textContent = messageText;
            } else {
                confirmMessage.textContent = '입력된 메시지가 없습니다.';
            }

            // (유효성 검사) 메시지가 비어있다면 중단
            if (!messageText) {
                alert('방송 메세지를 입력해주세요.');
                return; // 함수 종료
            }

            // --- (d) 모든 유효성 검사 통과 시 모달 전환 ---
            basicModalInstance.hide();
            confirmModalInstance.show();
        });
    }

    // 4. '확인' 모달의 '다시설정' 버튼(#confirm-btn-back) 클릭 이벤트
    if (backToConfigBtn) {
        backToConfigBtn.addEventListener('click', function() {
            // 확인 모달을 닫고, 방송 설정 모달을 다시 엽니다.
            confirmModalInstance.hide();
            basicModalInstance.show();
        });
    }

    // 5. '확인' 모달의 '최종 확인' 버튼(#confirm-btn-final) 클릭 이벤트
    if (finalConfirmBtn) {
        finalConfirmBtn.addEventListener('click', function() {

            // 지금은 일단 알림을 띄우고 모든 모달을 닫기
            alert('새 방송이 목록에 추가되었습니다.'); // (임시 알림)

            confirmModalInstance.hide();

            // (선택) '방송데이터 추가' 버튼이 있던 드롭다운을 닫기
            const dropdownToggle = document.querySelector('.sensor-list-header .dropdown [data-bs-toggle="dropdown"]');
            const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownToggle);
            if (dropdownInstance) {
                dropdownInstance.hide();
            }
        });
    }
});