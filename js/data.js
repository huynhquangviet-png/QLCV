/* data.js */

// 1. Danh sách thành viên tổ chức mẫu (Mock Members)
// Đã cấu hình rút gọn chỉ chứa duy nhất Admin Huỳnh Quang Việt để người dùng tự tạo thành viên khác
const INITIAL_MEMBERS = [
  { id: "m1", name: "Huỳnh Quang Việt", role: "Quản trị viên (Admin)", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100" }
];

// 2. Danh sách Phòng ban/Không gian làm việc (Workspaces / Departments)
const INITIAL_WORKSPACES = [
  { id: "ban_cong_nghe", name: "Ban Công nghệ", color: "#6366f1" }, // Indigo
  { id: "marketing", name: "Ban Truyền thông & Marketing", color: "#ec4899" }, // Pink
  { id: "nhan_su", name: "Ban Hành chính - Nhân sự", color: "#10b981" } // Emerald
];

// 3. Danh mục cá nhân mặc định (Personal Custom Projects)
const INITIAL_PERSONAL_PROJECTS = [
  { id: "hoc_tap", name: "Học tập & Kỹ năng", color: "#3b82f6" },
  { id: "suc_khoe", name: "Sức khỏe & Thể thao", color: "#10b981" },
  { id: "tai_chinh", name: "Quản lý Tài chính", color: "#f59e0b" }
];

// 4. Công việc cá nhân mẫu
const INITIAL_PERSONAL_TASKS = [
  {
    id: "p-1",
    title: "Đọc sách 30 phút buổi sáng",
    desc: "Đọc xong chương 4 cuốn sách 'Atomic Habits' và ghi lại các bài học áp dụng.",
    projectId: "hoc_tap",
    dueDate: "2026-05-31", // Today
    priority: "medium",
    completed: false,
    tags: ["Thói quen", "Đọc sách"]
  },
  {
    id: "p-2",
    title: "Chạy bộ 5km công viên",
    desc: "Mục tiêu hoàn thành trong vòng 30 phút. Đo nhịp tim và calories bằng đồng hồ.",
    projectId: "suc_khoe",
    dueDate: "2026-05-31", // Today
    priority: "low",
    completed: true,
    tags: ["Cardio", "Sức khỏe"]
  },
  {
    id: "p-3",
    title: "Thanh toán hóa đơn điện & internet",
    desc: "Hạn chót ngày 5 tháng sau, thanh toán qua Momo để nhận ưu đãi.",
    projectId: "tai_chinh",
    dueDate: "2026-06-03", // Future
    priority: "high",
    completed: false,
    tags: ["Hóa đơn", "Cần thiết"]
  },
  {
    id: "p-4",
    title: "Học khóa học JavaScript nâng cao trên Udemy",
    desc: "Học phần Clousures và Asynchronous Programming.",
    projectId: "hoc_tap",
    dueDate: "2026-05-30", // Past (Overdue)
    priority: "high",
    completed: false,
    tags: ["Lập trình", "Tự học"]
  }
];

// 5. Công việc tổ chức mẫu (Kanban Tasks)
// Đã cấu hình gán tất cả cho Admin Huỳnh Quang Việt (m1) để tránh lỗi tham chiếu
const INITIAL_KANBAN_TASKS = [
  {
    id: "t-1",
    workspaceId: "ban_cong_nghe",
    projectTag: "WEBSITE REDESIGN V2",
    title: "Thiết kế giao diện Dashboard trang quản trị",
    desc: "Yêu cầu: Thiết kế giao diện Dashboard theo phong cách Glassmorphism hiện đại, hỗ trợ cả Light/Dark Mode. Đảm bảo trực quan cho các biểu đồ SVG và dễ dùng trên điện thoại di động.",
    dueDate: "2026-05-31", // Today
    priority: "high",
    status: "in_progress",
    assigneeIds: ["m1"], // Huỳnh Quang Việt
    comments: [
      { authorId: "m1", authorName: "Huỳnh Quang Việt", text: "Thiết kế này cần chú ý hiển thị đẹp các biểu đồ SVG cột và tròn nhé.", time: "2026-05-30T09:00:00Z" }
    ],
    activities: [
      { text: "Huỳnh Quang Việt đã chuyển trạng thái từ 'To Do' sang 'In Progress'", time: "2026-05-30T08:30:00Z" }
    ]
  },
  {
    id: "t-2",
    workspaceId: "ban_cong_nghe",
    projectTag: "WEBSITE REDESIGN V2",
    title: "Lập trình module biểu đồ cột động bằng JavaScript",
    desc: "Hiện thực hóa biểu đồ cột bằng SVG nguyên bản, không dùng thư viện ngoài. Thêm các animation co giãn mượt mà khi lọc thời gian tuần/tháng.",
    dueDate: "2026-06-02",
    priority: "urgent",
    status: "todo",
    assigneeIds: ["m1"], // Huỳnh Quang Việt
    comments: [],
    activities: [
      { text: "Huỳnh Quang Việt đã tạo công việc này", time: "2026-05-29T14:00:00Z" }
    ]
  },
  {
    id: "t-3",
    workspaceId: "ban_cong_nghe",
    projectTag: "API INTEGRATION",
    title: "Viết API đồng bộ hóa dữ liệu LocalStorage",
    desc: "Xây dựng các API Endpoint để lưu trữ trạng thái người dùng lên Cloud DB dự phòng khi LocalStorage bị xóa sạch.",
    dueDate: "2026-06-15",
    priority: "medium",
    status: "backlog",
    assigneeIds: ["m1"], // Huỳnh Quang Việt
    comments: [],
    activities: []
  },
  {
    id: "t-4",
    workspaceId: "marketing",
    projectTag: "CAMPAIGN HÈ 2026",
    title: "Thiết kế kế hoạch nội dung mạng xã hội tháng 6",
    desc: "Xây dựng lịch đăng bài chi tiết cho Fanpage, TikTok và LinkedIn để quảng bá các tính năng quản lý công việc mới của ứng dụng.",
    dueDate: "2026-05-31", // Today
    priority: "high",
    status: "in_review",
    assigneeIds: ["m1"], // Huỳnh Quang Việt
    comments: [],
    activities: [
      { text: "Huỳnh Quang Việt đã chuyển trạng thái sang 'In Review'", time: "2026-05-31T08:00:00Z" }
    ]
  },
  {
    id: "t-5",
    workspaceId: "nhan_su",
    projectTag: "TUYỂN DỤNG 2026",
    title: "Hoàn thiện quy trình Onboarding nhân sự mới",
    desc: "Soạn thảo tài liệu hướng dẫn công việc, chuẩn bị tài khoản và lịch đào tạo nội bộ cho 3 Frontend Developers chuẩn bị gia nhập.",
    dueDate: "2026-05-25", // Completed past
    priority: "low",
    status: "done",
    assigneeIds: ["m1"], // Huỳnh Quang Việt
    comments: [],
    activities: [
      { text: "Huỳnh Quang Việt đã chuyển trạng thái sang 'Done'", time: "2026-05-25T17:30:00Z" }
    ]
  }
];

// 6. Cấu hình vai trò mô phỏng (Simulated User Roles mapping)
// Đã đổi toàn bộ sang Huỳnh Quang Việt đóng vai Admin/Manager/Member để xem trước giao diện các phân quyền
const ROLES = {
  admin: {
    key: "admin",
    name: "Huỳnh Quang Việt",
    roleName: "Quản trị viên (Admin)",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100",
    memberId: "m1"
  },
  manager: {
    key: "manager",
    name: "Huỳnh Quang Việt",
    roleName: "Quản lý dự án (Manager)",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100",
    memberId: "m1"
  },
  member: {
    key: "member",
    name: "Huỳnh Quang Việt",
    roleName: "Thành viên (Member)",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100",
    memberId: "m1"
  }
};

// 7. Cấu hình Quyền hạn Vai trò mặc định ban đầu
const INITIAL_ROLE_PERMISSIONS = {
  admin: {
    create_workspace: true,
    delete_workspace: true,
    create_task: true,
    edit_task: true,
    delete_task: true,
    move_task: true,
    move_own_task: true,
    export_excel: true
  },
  manager: {
    create_workspace: true,
    delete_workspace: false,
    create_task: true,
    edit_task: true,
    delete_task: true,
    move_task: true,
    move_own_task: true,
    export_excel: true
  },
  member: {
    create_workspace: false,
    delete_workspace: false,
    create_task: false,
    edit_task: false,
    delete_task: false,
    move_task: false,
    move_own_task: true, // Mặc định cho phép tự di chuyển việc của mình
    export_excel: false
  }
};

// 8. Quản lý trạng thái ứng dụng toàn cục (App State)
let appState = {
  members: [],
  workspaces: [],
  personalProjects: [],
  personalTasks: [],
  kanbanTasks: [],
  rolePermissions: null,
  currentRole: "admin", // default
  theme: "light"
};

// 9. Tải dữ liệu từ LocalStorage hoặc khởi tạo dữ liệu mẫu
function loadData() {
  const storedData = localStorage.getItem("taskflow_premium_data");
  if (storedData) {
    try {
      appState = JSON.parse(storedData);
      
      // Tự động phát hiện dữ liệu cũ ("Trần Minh Đức") và đặt lại sạch sẽ cho "Huỳnh Quang Việt"
      const hasOldAdmin = appState.members && appState.members.some(m => m.name === "Trần Minh Đức");
      if (hasOldAdmin) {
        console.log("Phát hiện dữ liệu mô phỏng cũ. Đang tự động đặt lại dữ liệu sang Huỳnh Quang Việt...");
        initializeDefaultState();
        return appState;
      }

      // Fallbacks in case format changed
      if (!appState.members || appState.members.length === 0) appState.members = INITIAL_MEMBERS;
      if (!appState.workspaces) appState.workspaces = INITIAL_WORKSPACES;
      if (!appState.personalProjects) appState.personalProjects = INITIAL_PERSONAL_PROJECTS;
      if (!appState.personalTasks) appState.personalTasks = INITIAL_PERSONAL_TASKS;
      if (!appState.kanbanTasks) appState.kanbanTasks = INITIAL_KANBAN_TASKS;
      if (!appState.rolePermissions) appState.rolePermissions = INITIAL_ROLE_PERMISSIONS;
      if (!appState.currentRole) appState.currentRole = "admin";
      if (!appState.theme) appState.theme = "light";
    } catch (e) {
      console.error("Lỗi khi đọc dữ liệu LocalStorage. Đang nạp lại dữ liệu mẫu...", e);
      initializeDefaultState();
    }
  } else {
    initializeDefaultState();
  }
  return appState;
}

function initializeDefaultState() {
  appState = {
    members: INITIAL_MEMBERS,
    workspaces: INITIAL_WORKSPACES,
    personalProjects: INITIAL_PERSONAL_PROJECTS,
    personalTasks: INITIAL_PERSONAL_TASKS,
    kanbanTasks: INITIAL_KANBAN_TASKS,
    rolePermissions: INITIAL_ROLE_PERMISSIONS,
    currentRole: "admin",
    theme: "light"
  };
  saveData();
}

function saveData() {
  localStorage.setItem("taskflow_premium_data", JSON.stringify(appState));
}

// 10. Công cụ Kiểm tra Phân quyền Giả lập Động (Dynamic Permission Check)
/**
 * Kiểm tra xem vai trò hiện tại có được phép thực hiện hành động không
 * @param {string} action - Hành động cần thực hiện
 * @param {object} task - Đối tượng công việc (nếu có)
 * @returns {object} { granted: boolean, reason: string }
 */
function checkPermission(action, task = null) {
  const role = appState.currentRole;
  const currentMemberId = ROLES[role] ? ROLES[role].memberId : "";
  const rolePerms = appState.rolePermissions[role] || {};

  // 1. Kiểm tra trực tiếp trong ma trận phân quyền cấu hình
  if (rolePerms[action] === true) {
    return { 
      granted: true, 
      reason: `Phê duyệt: Quyền hạn "${action}" đã được cấu hình kích hoạt trong Ma trận phân quyền.` 
    };
  }

  // 2. Trường hợp đặc biệt: Thành viên tự di chuyển công việc của chính mình
  if (action === "move_task" && task) {
    const isAssigned = task.assigneeIds.includes(currentMemberId);
    if (isAssigned && rolePerms["move_own_task"] === true) {
      return { 
        granted: true, 
        reason: "Phê duyệt: Bạn được phân công công việc này và Ma trận phân quyền cho phép tự cập nhật trạng thái." 
      };
    } else if (isAssigned) {
      return { 
        granted: false, 
        reason: "Từ chối: Bạn được giao việc nhưng Ma trận phân quyền hiện tại đang khóa việc tự cập nhật trạng thái." 
      };
    } else {
      return { 
        granted: false, 
        reason: "Từ chối: Bạn không được giao công việc này và vai trò của bạn không có quyền cập nhật công việc bất kỳ." 
      };
    }
  }

  // Tên hiển thị các quyền khi từ chối
  const actionNames = {
    create_workspace: "Tạo phòng ban / Không gian làm việc",
    delete_workspace: "Xóa phòng ban / Không gian làm việc",
    create_task: "Tạo công việc tổ chức mới",
    edit_task: "Sửa đổi chi tiết công việc nhóm",
    delete_task: "Xóa công việc tổ chức",
    move_task: "Di chuyển công việc bất kỳ trên Kanban",
    export_excel: "Xuất báo cáo Excel"
  };

  const actionLabel = actionNames[action] || action;
  return { 
    granted: false, 
    reason: `Từ chối: Vai trò của bạn hiện không được cấp quyền thực hiện: "${actionLabel}". Vui lòng tùy chỉnh trong Ma trận Phân quyền.` 
  };
}
