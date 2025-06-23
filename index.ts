import { load, type Cheerio, type CheerioAPI } from "cheerio"
import type { Element } from "domhandler"
import {
  ABEigaService,
  createOImage,
  defineType,
  registerPlugin,
  type Season,
  StatusEnum,
  type Eiga,
  type EigaCategory,
  type EigaEpisode,
  type EigaEpisodes,
  type EigaHome,
  type Genre,
  type MetaEiga,
  type ServerSource,
  type ServiceInit,
  type SourceVideo,
  type Filter
} from "@hoyomi/bridge_ts"
import { version, description } from "./package.json"

const globalFilters: Filter[] = [
  {
    name: "Thể loại",
    key: "0",
    multiple: true,
    options: [
      {
        name: "Anime",
        value: "1"
      },
      {
        name: "Hành động",
        value: "2"
      },
      {
        name: "Hài hước",
        value: "3"
      },
      {
        name: "Tình cảm",
        value: "4"
      },
      {
        name: "Harem",
        value: "5"
      },
      {
        name: "Bí ẩn",
        value: "6"
      },
      {
        name: "Bi kịch",
        value: "7"
      },
      {
        name: "Giả tưởng",
        value: "8"
      },
      {
        name: "Học đường",
        value: "9"
      },
      {
        name: "Đời thường",
        value: "10"
      },
      {
        name: "Võ thuật",
        value: "11"
      },
      {
        name: "Trò chơi",
        value: "12"
      },
      {
        name: "Thám tử",
        value: "13"
      },
      {
        name: "Lịch sử",
        value: "14"
      },
      {
        name: "Siêu năng lực",
        value: "15"
      },
      {
        name: "Shounen",
        value: "16"
      },
      {
        name: "Shounen AI",
        value: "17"
      },
      {
        name: "Shoujo",
        value: "18"
      },
      {
        name: "Shoujo AI",
        value: "19"
      },
      {
        name: "Thể thao",
        value: "20"
      },
      {
        name: "Âm nhạc",
        value: "21"
      },
      {
        name: "Psychological",
        value: "22"
      },
      {
        name: "Mecha",
        value: "23"
      },
      {
        name: "Quân đội",
        value: "24"
      },
      {
        name: "Drama",
        value: "25"
      },
      {
        name: "Seinen",
        value: "26"
      },
      {
        name: "Siêu nhiên",
        value: "27"
      },
      {
        name: "Phiêu lưu",
        value: "28"
      },
      {
        name: "Kinh dị",
        value: "29"
      },
      {
        name: "Ma cà rồng",
        value: "30"
      },
      {
        name: "Tokusatsu",
        value: "31"
      },
      {
        name: "Samurai",
        value: "32"
      },
      {
        name: "Viễn tưởng",
        value: "33"
      },
      {
        name: "CN Animation",
        value: "34"
      },
      {
        name: "Tiên hiệp",
        value: "35"
      },
      {
        name: "Kiếm hiệp",
        value: "36"
      },
      {
        name: "Xuyên không",
        value: "37"
      },
      {
        name: "Trùng sinh",
        value: "38"
      },
      {
        name: "Huyền ảo",
        value: "39"
      },
      {
        name: "[CNA] Ngôn tình",
        value: "40"
      },
      {
        name: "Dị giới",
        value: "41"
      },
      {
        name: "[CNA] Hài hước",
        value: "42"
      },
      {
        name: "Đam mỹ",
        value: "43"
      },
      {
        name: "Võ hiệp",
        value: "44"
      },
      {
        name: "Ecchi",
        value: "45"
      },
      {
        name: "Demon",
        value: "46"
      },
      {
        name: "Live Action",
        value: "47"
      },
      {
        name: "Thriller",
        value: "48"
      },
      {
        name: "Khoa huyễn",
        value: "49"
      }
    ]
  },
  {
    name: "Năm",
    key: "1",
    multiple: true,
    options: [
      {
        name: "2025",
        value: "2025"
      },
      {
        name: "2024",
        value: "2024"
      },
      {
        name: "2023",
        value: "2023"
      },
      {
        name: "2022",
        value: "2022"
      },
      {
        name: "2021",
        value: "2021"
      },
      {
        name: "2020",
        value: "2020"
      },
      {
        name: "2019",
        value: "2019"
      },
      {
        name: "2018",
        value: "2018"
      },
      {
        name: "Trước 2014",
        value: "1111"
      }
    ]
  },
  {
    name: "Số tập",
    key: "2",
    multiple: true,
    options: [
      {
        name: "Full",
        value: "9999"
      },
      {
        name: "300",
        value: "300"
      },
      {
        name: "200",
        value: "200"
      },
      {
        name: "100",
        value: "100"
      },
      {
        name: "50",
        value: "50"
      },
      {
        name: "20",
        value: "20"
      },
      {
        name: "10",
        value: "10"
      }
    ]
  },
  {
    name: "Trạng thái",
    key: "3",
    multiple: true,
    options: [
      {
        name: "Đang tiến hành",
        value: "0"
      },
      {
        name: "Hoàn thành",
        value: "1"
      }
    ]
  }
]

class AnimeHay extends ABEigaService {
  override writeWith = "typescript"
  override init: ServiceInit = {
    name: "AnimeHay",
    faviconUrl: createOImage("/themes/img/favicon.ico"),
    rootUrl: "https://animehay.ceo/",
    version,
    description,
    language: "vi"
  }
  async getURL(eigaId: string, chapterId?: string): Promise<string> {
    if (!chapterId) return `${this.baseUrl}/thong-tin-phim/${eigaId}.html`

    return `${this.baseUrl}/xem-phim/${eigaId}-${chapterId}.html`
  }

  private parseContainer($: CheerioAPI, $container: Cheerio<Element>): Eiga[] {
    return $container
      .find(".movie-item")
      .toArray()
      .map((item) => {
        const $item = $(item)

        const eiga: Eiga = {
          name: $item.find(".name-movie").text().trim(),
          eigaId: $item
            .children("a")
            .attr("href")!
            .split("/")
            .at(-1)!
            .replace(".html", ""),
          image: createOImage($item.find("img").attr("src")!),
          notice: $item.find(".episode-latest").text().trim(),
          rate: Number.parseFloat($item.find(".score").text().trim())
        }

        return eiga
      })
  }

  async home(): Promise<EigaHome> {
    const html = await fetch("").then((res) => res.text())
    const $ = load(html)

    return defineType<EigaHome>({
      categories: [
        {
          name: "Mới cập nhật",
          categoryId: "phim-moi-cap-nhat",
          gridView: true,
          items: this.parseContainer($, $(".movies-list.ah-frame-bg"))
        }
      ]
    })
  }
  async getCategory(params: {
    categoryId: string
    page: number
    filters: { [key: string]: string[] | null }
  }): Promise<EigaCategory> {
    const url =
      Object.keys(params.filters).length > 0
        ? `/loc-phim/${btoa(
            Array.from({ ...params.filters, length: 4 }).join(",")
          )}`
        : params.categoryId.replace("_", "/") +
          (params.page > 1 ? "" : `trang-${params.page}`) +
          ".html"

    const html = await fetch(url).then((res) => res.text())
    const $ = load(html)

    const totalPages = Number.parseInt(
      $("div.pagination > div > a:last-child")
        .attr("href")
        ?.split("/")
        .at(-1)
        ?.replace(".html", "")
        .match(/(\d+)$/)?.[0] ?? "1"
    )

    return defineType<EigaCategory>({
      name: $("#ah_wrapper > div.ah_content > div.margin-10-0.bg-gray-2 > div")
        .text()
        .trim(),
      url,
      items: this.parseContainer($, $(".movies-list")),
      page: Number.parseInt(
        $("#ah_wrapper > div.ah_content > div.pagination > div > a.active_page")
          .text()
          .trim() || "1"
      ),
      totalItems: totalPages * 30,
      totalPages,
      filters: globalFilters
    })
  }
  async getDetails(eigaId: string): Promise<MetaEiga> {
    const html = await fetch(`/thong-tin-phim/${eigaId}.html`).then((res) =>
      res.text()
    )
    const $ = load(html)

    return defineType<MetaEiga>({
      name: $(".heading_movie").text().trim(),
      originalName: $(".name_other > div").last().text().trim(),
      image: createOImage($(".head.ah-frame-bg img").attr("src")!),
      description: $(".desc.ah-frame-bg > div").last().html() ?? "",
      seasons: $(".bind_movie a")
        .toArray()
        .map((season) => {
          const $season = $(season)

          return defineType<Season>({
            name: $season.text().trim(),
            eigaId: $season
              .attr("href")!
              .split("/")
              .at(-1)!
              .replace(".html", "")
          })
        }),
      genres: $(".list_cate a")
        .toArray()
        .map((genre) => {
          const $genre = $(genre)

          return defineType<Genre>({
            name: $genre.text().trim(),
            genreId: "the-loai_" + $genre.attr("href")!.split("/").at(-1)!
          })
        }),
      status:
        {
          "Đang tiến hành": StatusEnum.Ongoing,
          "Hoàn thành": StatusEnum.Completed
        }[$(".status > div").last().text().trim()] ?? StatusEnum.Unknown,
      rate:
        Number.parseFloat(
          $(".score > div").last().text().split(" || ")[0]?.trim() ?? ""
        ) || undefined,
      countRate:
        Number.parseInt(
          $(".score > div")
            .last()
            .text()
            .split(" || ")[1]
            ?.trim()
            .replaceAll(/\./g, "") ?? ""
        ) || undefined,
      yearOf:
        Number.parseInt($(".update_time > div").last().text().trim()) ||
        undefined,
      duration: $(".duration > div").last().text().trim()
    })
  }
  async getEpisodes(eigaId: string): Promise<EigaEpisodes> {
    const html = await fetch(`/thong-tin-phim/${eigaId}.html`).then((res) =>
      res.text()
    )
    const $ = load(html)

    return defineType<EigaEpisodes>({
      episodes: $(".list-item-episode > a")
        .toArray()
        .reverse()
        .map((episode) => {
          const $episode = $(episode)

          return defineType<EigaEpisode>({
            name: $episode.text().trim(),
            episodeId:
              "tap-" +
              $episode.attr("href")!.split("-tap-")[1]!.replace(".html", "")
          })
        })
    })
  }

  async getServers(params: {
    eigaId: string
    episode: EigaEpisode
  }): Promise<ServerSource[]> {
    const html = await fetch(
      `/xem-phim/${params.eigaId}/${params.episode.episodeId}.html`
    ).then((res) => res.text())
    const $ = load(html)

    return $("#list_sv > a")
      .toArray()
      .map((anchor) => {
        const $anchor = $(anchor)

        const name = $anchor.attr("name") ?? $anchor.text().trim()
        let extra: {
          file: string
          type: string
          headers?: Record<string, string>
        }
        switch (name) {
          case "TOK":
            const tik = html.match(/tik:\s+'([^']+)'/)?.[1]
            if (!tik) throw new Error("tik not found")

            extra = { file: tik, type: "hls" }
            break

          case "SS":
            const ss = html.match(/src="(https:\/\/ssplay[^"]+)"/)?.[1]
            if (!ss) throw new Error("ss not found")

            const url = new URL(ss)

            extra = {
              file: ss.replace("/v/", "/ST/"),
              headers: {
                referer: url.origin
              },
              type: "hls"
            }
            break
          default:
            return
        }

        return defineType<ServerSource>({
          name,
          serverId: name.toLowerCase(),
          extra: JSON.stringify(extra)
        })
      })
      .filter(Boolean) as ServerSource[]
  }
  async getSource({
    eigaId,
    episode,
    server
  }: {
    eigaId: string
    episode: EigaEpisode
    server?: ServerSource
  }): Promise<SourceVideo> {
    if (server?.extra) {
      const extra = JSON.parse(server.extra) as {
        type: string
        file: string
        headers?: Record<string, string>
      }

      switch (extra.type) {
        case "hls":
          return defineType<SourceVideo>({
            src: extra.file,
            url: extra.file,
            headers: new Headers(extra.headers),
            type: "hls"
          })
      }
    }

    const html = await fetch(
      `/xem-phim/${eigaId}/${episode.episodeId}.html`
    ).then((res) => res.text())

    const tik = html.match(/tik: '([^']+)'/)?.[1]
    if (!tik) throw new Error("tik not found")

    return defineType<SourceVideo>({
      src: tik,
      url: tik,
      type: "hls"
    })
  }
  search(params: {
    keyword: string
    page: number
    filters: { [key: string]: string[] | null }
    quick: boolean
  }): Promise<EigaCategory> {
    return this.getCategory({
      categoryId: `tim-kiem_${params.keyword}`,
      page: params.page,
      filters: params.filters
    })
  }
}

registerPlugin(AnimeHay)
