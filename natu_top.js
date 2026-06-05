document.addEventListener("DOMContentLoaded", function() {
    // ユーザー設定の取得（設定がない場合の安全対策含む）
    const categories = window.natuSettings || {};
    
    // --- トップ画像URLの自動設定 ---
    if (settings.topImage) {
        var headerTop = document.getElementById('header_top');
        if (headerTop) {
            // CSSの background-image を動的に書き換える
            headerTop.style.backgroundImage = 'url("' + settings.topImage + '")';
        }
    }

    // cate1 〜 cate4 までをループ処理
    for (let id in categories) {
        let url = categories[id];
        
        // URLが空欄の場合は処理をスキップ
        if (!url) continue;

        // 【1】IDで指定された要素（念のための互換性維持）
        let elById = document.getElementById(id);
        if (elById) {
            elById.href = url;
        }
        
        // 【2】クラスで指定された複数の要素（PCナビ・スマホナビ・ピックアップ全てを一括変更）
        let classElements = document.querySelectorAll('.set-' + id);
        classElements.forEach(function(el) {
            el.href = url;
        });
    }
    
    // ハンバーガーメニューの開閉処理
    $('#hamburger-btn, #close-btn, #menu-overlay').on('click', function() {
        $('#slide-menu').toggleClass('active');
        $('#menu-overlay').toggleClass('active');
    });
});