document.addEventListener("DOMContentLoaded", function() {
    // ユーザー設定の読み込み
    const settings = window.natuSettings || {};
    
    // --- 1. メニューURLの一括設定 ---
    for (let id in settings) {
        if (!id.startsWith('cate')) continue;
        let url = settings[id];
        if (!url) continue;

        // ID指定用（互換性維持）
        let elById = document.getElementById(id);
        if (elById) elById.href = url;
        
        // クラス指定用（メニューなどの複数箇所を一括変更）
        let classElements = document.querySelectorAll('.set-' + id);
        classElements.forEach(function(el) {
            el.href = url;
        });
    }

    // --- 2. ハンバーガーメニューの開閉処理 ---
    var hamBtn = document.getElementById('hamburger-btn');
    var clsBtn = document.getElementById('close-btn');
    var slideMenu = document.getElementById('slide-menu');
    var menuOverlay = document.getElementById('menu-overlay');
    
    if(hamBtn && clsBtn && slideMenu && menuOverlay) {
        var toggleMenu = function() {
            slideMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
        };
        hamBtn.addEventListener('click', toggleMenu);
        clsBtn.addEventListener('click', toggleMenu);
        menuOverlay.addEventListener('click', toggleMenu);
    }
});