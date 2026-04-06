using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DITT.Host.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFrontendBundlePathToTool : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FrontendBundlePath",
                table: "Tools",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FrontendBundlePath",
                table: "Tools");
        }
    }
}
