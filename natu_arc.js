document.addEventListener("DOMContentLoaded", function() {
    // ユーザー設定の読み込み
    const settings = window.natuSettings || {};
    
    // --- 1. トップ画像URLの自動設定（日本語URL対応版） ---
    if (settings.topImage) {
        var headerTop = document.getElementById('header_top');
        if (headerTop) {
            headerTop.style.backgroundImage = 'url("' + encodeURI(settings.topImage) + '")';
        }
    }

    // --- 2. メニュー・ピックアップの自動設定（名前とURL） ---
    for (let id in settings) {
        // 設定項目が 'cate' から始まるものだけを処理
        if (!id.startsWith('cate')) continue;
        
        // 新しい {url: "...", name: "..."} の形式を読み取る
        let data = settings[id];
        if (!data || !data.url) continue;

        // URLの書き換え（クラス指定）
        let linkElements = document.querySelectorAll('.set-' + id);
        linkElements.forEach(function(el) {
            el.href = data.url;
        });

        // 名前の書き換え（クラス指定）
        let nameElements = document.querySelectorAll('.name-' + id);
        nameElements.forEach(function(el) {
            el.textContent = data.name;
        });

        // 念のための互換性維持（ID指定用）
        let elById = document.getElementById(id);
        if (elById) elById.href = data.url;
    }

    // --- 3. ハンバーガーメニューの開閉処理 ---
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
