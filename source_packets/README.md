# source_packets — private source inputs

이 디렉터리의 PDF는 **비공개 소스 입력물**이다.

- 커밋 금지 (`.gitignore`가 `*.pdf`/`*.hwp`를 차단하고, V43/no-public-pdf-assets 테스트가 집행)
- `web/public` 복사 금지 — 보고서/논문의 페이지 이미지·도면·사진은 render asset이 될 수 없다
- 허용되는 파생물: `data/source-segments.json`의 **짧은 paraphrase + page/table/figure locator**뿐

| 파일 | 소스 |
|---|---|
| report2022_min_pack_for_fable.pdf / report2022_full_source.pdf | 2022 『경주 동궁과 월지 A건물지 발굴조사보고서』 |
| kim2023_full_article_for_fable.pdf | 김경열 2023, 신라사학보 57 (스캔본) |
| lee2023_core_pack_for_fable.pdf / lee2023_core_source.pdf | 이현태 2023, 선사와 고대 72 |
| ji2023_core_pack_for_fable.pdf / ji2023_core_source.pdf | 지영배 2023, 한국고고학보 129 |
| source_segments_seed_gongpo_m15.json | segment seed (커밋됨 — 텍스트) |
