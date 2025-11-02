(function() {
    /**
     * broadcast.html 페이지의 모든 스크립트 로직을 담는 함수
     */
    function initBroadcastPage() {

        // --- (A) 영구 요소 (모달 등) ---
        const popupBox = document.getElementById('sensor-detail-popup');
        const closeButton = document.getElementById('popup-close-btn');
        const sensorCards = document.querySelectorAll('.sensor-modal-card');
        const allIntervalGroups = document.querySelectorAll('.broadcast-modal-interval-group');
        const lastBroadcastModal = document.getElementById('lastBroadcastModal');
        const confirmBroadcastBtn = document.querySelector('#lastBroadcastModal .last-broadcast-btn-confirm');
        const allCheckboxes = document.querySelectorAll('.sensor-modal-card .checkbox');
        const basicModal = document.getElementById('modal-basic');
        const confirmModal = document.getElementById('confirmModal');
        const openConfirmBtn = document.getElementById('btn-open-confirm');
        const backToConfigBtn = document.getElementById('confirm-btn-back');
        const finalConfirmBtn = document.getElementById('confirm-btn-final');

        // --- (B) 동적 요소 (페이지 내부) ---
        const broadcastAddBtn = document.querySelector('.broadcast-add-btn');
        const fixedDropdownElements = document.querySelectorAll('.dropdown-fixed');
        const headerDropdownToggles = document.querySelectorAll('.sensor-list-header .dropdown [data-bs-toggle="dropdown"]');

        // [안전 장치] (꼬임 방지)
        if (!broadcastAddBtn) {
            return; // broadcast.html이 아니면 중단
        }

        // [수정] 부트스트랩 인스턴스 생성 (에러 방지)
        // 이 코드는 *반드시* 모든 리스너 등록 *전에* 와야 합니다.
        const basicModalInstance = bootstrap.Modal.getOrCreateInstance(basicModal);
        const confirmModalInstance = bootstrap.Modal.getOrCreateInstance(confirmModal);

        // --- (C) 이벤트 리스너 등록 ---

        // 1. 팝업 닫기 버튼 (영구 요소 - 플래그)
        if (closeButton && !closeButton.dataset.listenerAttached) {
            closeButton.addEventListener('click', function() {
                popupBox.classList.remove('show');
            });
            closeButton.dataset.listenerAttached = 'true';
        }

        // 2. 드롭다운 'fixed' (동적 요소)
        fixedDropdownElements.forEach(function(element) {
            var toggleButton = element.querySelector('[data-bs-toggle="dropdown"]');
            new bootstrap.Dropdown(toggleButton, {
                popperConfig: {
                    strategy: 'fixed'
                }
            });
        });

        // 3. 드롭다운 상호 배제 (동적 요소)
        // (이 코드는 broadcast.html에 필요 없어 보이지만, 만약을 위해 남겨둡니다)
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

        // 4. 드롭다운 닫기 버튼 (동적 요소)
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

        // 5. (모달 동기화 로직) (영구 요소 - 플래그)
        sensorCards.forEach(function(card) {
            const checkbox = card.querySelector('.checkbox');
            if (checkbox) {
                checkbox.checked = card.classList.contains('active');
            }

            if (!card.dataset.clickListenerAttached) {
                card.addEventListener('click', function(event) {
                    if (!event.target.closest('.sensor-modal-checkmark')) {
                        const checkbox = this.querySelector('.checkbox');
                        if (checkbox) {
                            checkbox.checked = !checkbox.checked;
                            checkbox.dispatchEvent(new Event('change'));
                        }
                    }
                });
                card.dataset.clickListenerAttached = 'true';
            }
        });

        // 6. 체크박스 (영구 요소 - 플래그)
        allCheckboxes.forEach(function(checkbox) {
            if (!checkbox.dataset.changeListenerAttached) {
                checkbox.addEventListener('change', function() {
                    const parentCard = this.closest('.sensor-modal-card');
                    if (parentCard) {
                        parentCard.classList.toggle('active', this.checked);
                    }
                });
                checkbox.dataset.changeListenerAttached = 'true';
            }
        });

        // 7. 체크박스 영역 클릭 (영구 요소 - 플래그)
        document.querySelectorAll('.sensor-modal-checkmark').forEach(function(checkmarkArea) {
            if (!checkmarkArea.dataset.clickListenerAttached) {
                checkmarkArea.addEventListener('click', function(event) {
                    event.stopPropagation();
                });
                checkmarkArea.dataset.clickListenerAttached = 'true';
            }
        });

        // 8. 방송 간격 버튼 (영구 요소 - 플래그)
        allIntervalGroups.forEach(function(group) {
            const allButtonsInGroup = group.querySelectorAll('.broadcast-modal-btn');
            allButtonsInGroup.forEach(function(button) {
                if (!button.dataset.clickListenerAttached) {
                    button.addEventListener('click', function() {
                        allButtonsInGroup.forEach(function(btn) {
                            btn.classList.remove('active');
                        });
                        this.classList.add('active');
                    });
                    button.dataset.clickListenerAttached = 'true';
                }
            });
        });

        // 9. 지난 방송 모달 z-index (영구 요소 - 플래그)
        if (lastBroadcastModal && !lastBroadcastModal.dataset.shownListenerAttached) {
            lastBroadcastModal.addEventListener('shown.bs.modal', function () {
                setTimeout(function() {
                    // (z-index 로직 ...)
                }, 50);
            });
            lastBroadcastModal.dataset.shownListenerAttached = 'true';
        }

        // 10. 지난 방송 '확인' 버튼 (영구 요소 - 플래그)
        if (confirmBroadcastBtn && !confirmBroadcastBtn.dataset.clickListenerAttached) {
            confirmBroadcastBtn.addEventListener('click', function() {
                const selectedRadio = document.querySelector('input[name="last-broadcast-radio"]:checked');
                if (selectedRadio) {
                    // ... (데이터 전달 로직) ...
                    const modalInstance = bootstrap.Modal.getInstance(lastBroadcastModal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                } else {
                    alert("불러올 항목을 선택해주세요.");
                }
            });
            confirmBroadcastBtn.dataset.clickListenerAttached = 'true';
        }

        // 11. 방송 설정 '확인' 버튼 (영구 요소 - 플래그)
        if (openConfirmBtn && !openConfirmBtn.dataset.clickListenerAttached) {
            openConfirmBtn.addEventListener('click', function() {
                // ... (유효성 검사 로직) ...
                basicModalInstance.hide();
                confirmModalInstance.show();
            });
            openConfirmBtn.dataset.clickListenerAttached = 'true';
        }

        // 12. '다시 설정' 버튼 (영구 요소 - 플래그)
        if (backToConfigBtn && !backToConfigBtn.dataset.clickListenerAttached) {
            backToConfigBtn.addEventListener('click', function() {
                confirmModalInstance.hide();
                basicModalInstance.show();
            });
            backToConfigBtn.dataset.clickListenerAttached = 'true';
        }

        // 13. '최종 확인' 버튼 (영구 요소 - 플래그)
        if (finalConfirmBtn && !finalConfirmBtn.dataset.clickListenerAttached) {
            finalConfirmBtn.addEventListener('click', function() {
                alert('새 방송이 목록에 추가되었습니다.');
                confirmModalInstance.hide();
                const dropdownToggle = document.querySelector('.sensor-list-header .dropdown [data-bs-toggle="dropdown"]');
                const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownToggle);
                if (dropdownInstance) {
                    dropdownInstance.hide();
                }
            });
            finalConfirmBtn.dataset.clickListenerAttached = 'true';
        }
    }

    /**
     * [SPA + 새로고침 호환 래퍼]
     * 1, 2번 페이지와 동일하게 'bootstrap'이 로드될 때까지 기다립니다.
     */
    function checkLibrariesAndRun() {
        if (typeof bootstrap !== 'undefined') {
            // 1. 라이브러리 로드 완료!
            // 100ms 지연 (무거운 1번 페이지와 통일, 가장 안전한 값)
            setTimeout(initBroadcastPage, 100);
        } else {
            // 2. 아직 로드 안됨 (새로고침 중...)
            setTimeout(checkLibrariesAndRun, 50);
        }
    }
    checkLibrariesAndRun();
})();