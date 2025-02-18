document.addEventListener("DOMContentLoaded", function () {
    const calendarTitle = document.getElementById("calendar-title");
    const prevWeekBtn = document.getElementById("prev-week");
    const nextWeekBtn = document.getElementById("next-week");
    const scheduleTable = document.getElementById("schedule-table");
    const instructorsList = document.getElementById("instructors");
    const profilePic = document.getElementById("profile-pic");
    let currentDate = new Date();

    function formatWeekRange(date) {
        let start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1);
        let end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.getDate()}-${end.getDate()} ${end.toLocaleString('ro-RO', { month: 'long' })}`;
    }

    function updateCalendarTitle() {
        calendarTitle.textContent = formatWeekRange(currentDate);
    }

    function loadSchedule() {
        fetch("/api/get_schedule/")
            .then(response => response.json())
            .then(data => {
                const slots = document.querySelectorAll(".slot");
                slots.forEach(slot => {
                    slot.classList.remove("available");
                    slot.textContent = "";
                });
                data.forEach(slot => {
                    const slotElement = document.querySelector(`.slot[data-hour='${slot.hour}'][data-day='${slot.day}']`);
                    if (slotElement) {
                        slotElement.classList.add("available");
                        slotElement.textContent = slot.time;
                    }
                });
            });
    }

    prevWeekBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() - 7);
        updateCalendarTitle();
        loadSchedule();
    });

    nextWeekBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() + 7);
        updateCalendarTitle();
        loadSchedule();
    });

    instructorsList.addEventListener("click", (event) => {
        if (event.target.tagName === "LI") {
            profilePic.src = event.target.dataset.img;
            profilePic.style.display = "block";
        }
    });

    updateCalendarTitle();
    loadSchedule();
});