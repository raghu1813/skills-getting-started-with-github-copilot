document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Clear and repopulate select dropdown
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            <div class="participants-list">
              ${details.participants.length
                ? details.participants.map((email, idx) => `
                  <div class="participant-row">
                    <span class="participant-name">${email}</span>
                    <span class="delete-icon" title="Unregister" data-activity="${name}" data-index="${idx}">&#128465;</span>
                  </div>
                `).join('')
                : '<div class="no-participants">No participants yet.</div>'}
            </div>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );
      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Wait for backend to confirm before refreshing activities
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Initialize app
  fetchActivities();

  // Delegate click event for delete icons
  document.getElementById('activities-list').addEventListener('click', async function(e) {
    if (e.target.classList.contains('delete-icon')) {
      const activity = e.target.getAttribute('data-activity');
      const index = e.target.getAttribute('data-index');
      if (activity && index !== null) {
        try {
          // Get participant email from DOM
          const participantEmail = e.target.parentElement.querySelector('.participant-name').textContent;
          const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(participantEmail)}`, {
            method: 'POST',
          });
          const result = await response.json();
          if (response.ok) {
            messageDiv.textContent = result.message || 'Participant unregistered.';
            messageDiv.className = 'success';
            await fetchActivities();
          } else {
            messageDiv.textContent = result.detail || 'Failed to unregister participant.';
            messageDiv.className = 'error';
          }
          messageDiv.classList.remove('hidden');
          setTimeout(() => {
            messageDiv.classList.add('hidden');
          }, 5000);
        } catch (error) {
          messageDiv.textContent = 'Error unregistering participant.';
          messageDiv.className = 'error';
          messageDiv.classList.remove('hidden');
        }
      }
    }
  });
});
