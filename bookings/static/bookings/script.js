document.addEventListener("DOMContentLoaded", function () {
    const calendarTitle = document.getElementById("calendar-title");
    const prevWeekBtn = document.getElementById("prev-week");
    const nextWeekBtn = document.getElementById("next-week");
    const scheduleTable = document.getElementById("schedule-table");
    const instructorsList = document.getElementById("instructors");
    const profilePic = document.getElementById("profile-pic");
    let currentDate = new Date();

    document.querySelectorAll(".car-type-btn").forEach(button => {
        button.addEventListener("click", function() {
            document.getElementById("car-type").value = this.dataset.value;
            document.querySelectorAll(".car-type-btn").forEach(btn => btn.classList.remove("selected"));
            this.classList.add("selected");
        });
    });
    
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
        fetch("/get-timeslots/")  // ✅ Updated the correct API endpoint
            .then(response => response.json())
            .then(data => {
                const slots = document.querySelectorAll(".slot");
                slots.forEach(slot => {
                    slot.classList.remove("available");
                    slot.textContent = "";
                    slot.style.backgroundColor = ""; // Reset previous colors
                });

                data.forEach(slot => {
                    let slotDateTime = new Date(slot.start);
                    let hour = slotDateTime.getHours(); // Extracts hour
                    let day = slotDateTime.getDay(); // Extracts day (0=Sunday, 1=Monday, etc.)

                    const slotElement = document.querySelector(`.slot[data-hour='${hour}'][data-day='${day}']`);
                    if (slotElement) {
                        slotElement.classList.add("available");
                        slotElement.textContent = `${slot.title} (${slot.start.split("T")[1]})`;
                        slotElement.style.backgroundColor = slot.color; // ✅ Uses API color (blue if available, red if booked)
                    }
                });
            })
            .catch(error => console.error("Error loading schedule:", error));
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
